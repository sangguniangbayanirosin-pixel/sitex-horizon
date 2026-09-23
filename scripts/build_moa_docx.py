#!/usr/bin/env python3
"""Philippine-form MOA → .docx (A4, Times New Roman, notarial layout)."""

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsmap
from docx.shared import Cm, Inches, Pt, RGBColor, Twips, Emu

OUT = "/workspace/artifacts/SITEX-HORIZON-MOA.docx"


def set_run_font(run, name="Times New Roman", size=12, bold=False, italic=False, all_caps=False):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(0x11, 0x11, 0x11)
    if all_caps:
        rPr = run._element.get_or_add_rPr()
        caps = OxmlElement("w:caps")
        caps.set(qn("w:val"), "true")
        rPr.append(caps)


def pstyle(p, align="justify", first=0, before=0, after=8, line=1.15, keep=False):
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE
    if first:
        pf.first_line_indent = Cm(first)
    else:
        pf.first_line_indent = Cm(0)
    pf.alignment = {
        "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
        "left": WD_ALIGN_PARAGRAPH.LEFT,
        "right": WD_ALIGN_PARAGRAPH.RIGHT,
    }[align]
    if keep:
        pf.keep_with_next = True


def add(doc, text, *, align="justify", size=12, bold=False, italic=False, first=1.25, before=0, after=8, caps=False, keep=False):
    p = doc.add_paragraph()
    pstyle(p, align=align, first=first if align == "justify" else 0, before=before, after=after, keep=keep)
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold, italic=italic, all_caps=caps)
    return p


def add_mixed(doc, parts, *, align="justify", first=1.25, before=0, after=8, size=12):
    """parts: list of (text, bold, italic)."""
    p = doc.add_paragraph()
    pstyle(p, align=align, first=first if align == "justify" else 0, before=before, after=after)
    for text, bold, italic in parts:
        run = p.add_run(text)
        set_run_font(run, size=size, bold=bold, italic=italic)
    return p


def whereas(doc, body, lead="WHEREAS"):
    add_mixed(
        doc,
        [(lead, True, False), (", ", False, False), (body, False, False)],
        first=1.25,
        after=8,
    )


def article(doc, roman, title):
    p = doc.add_paragraph()
    pstyle(p, align="center", first=0, before=16, after=8, keep=True)
    run = p.add_run(f"ARTICLE {roman}")
    set_run_font(run, size=12, bold=True, all_caps=True)
    p2 = doc.add_paragraph()
    pstyle(p2, align="center", first=0, before=0, after=10, keep=True)
    r2 = p2.add_run(title)
    set_run_font(r2, size=12, bold=True, all_caps=True)
    # underline the title
    r2.underline = True


def lettered(doc, letter, text):
    p = doc.add_paragraph()
    pstyle(p, align="justify", first=0, after=6)
    p.paragraph_format.left_indent = Cm(1.25)
    run = p.add_run(f"{letter}.  {text}")
    set_run_font(run, size=12)


def set_cell_shading(cell, hex_color):
    tc = cell._tePr if hasattr(cell, "_tePr") else cell._tc
    tcPr = tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def shade(cell, color="E8E8E8"):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def set_cell_border(cell, **kwargs):
    """kwargs: top, left, bottom, right = {sz, color, val}"""
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = tcPr.find(qn("w:tcBorders"))
    if tcBorders is None:
        tcBorders = OxmlElement("w:tcBorders")
        tcPr.append(tcBorders)
    for edge, spec in kwargs.items():
        el = tcBorders.find(qn(f"w:{edge}"))
        if el is None:
            el = OxmlElement(f"w:{edge}")
            tcBorders.append(el)
        for k, v in spec.items():
            el.set(qn(f"w:{k}"), str(v))


def no_borders(table):
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else OxmlElement("w:tblPr")
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "nil")
        el.set(qn("w:sz"), "0")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "auto")
        borders.append(el)
    tblPr.append(borders)


def cell_text(cell, text, *, size=10.5, bold=False, align="left", italic=False):
    cell.text = ""
    p = cell.paragraphs[0]
    pstyle(p, align=align, first=0, before=2, after=2, line=1.1)
    run = p.add_run(text)
    set_run_font(run, size=size, bold=bold, italic=italic)


def add_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = True
    for i, h in enumerate(headers):
        cell_text(table.rows[0].cells[i], h, size=10, bold=True, align="center")
        shade(table.rows[0].cells[i], "D9D9D9")
    for r, row in enumerate(rows, start=1):
        for c, val in enumerate(row):
            cell_text(table.rows[r].cells[c], val, size=10)
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Cm(w)
    doc.add_paragraph()
    return table


def sig_block(doc, left_title, left_lines, right_title, right_lines):
    table = doc.add_table(rows=1, cols=2)
    no_borders(table)
    table.columns[0].width = Cm(8.2)
    table.columns[1].width = Cm(8.2)

    def fill(cell, title, lines):
        cell.text = ""
        p = cell.paragraphs[0]
        pstyle(p, align="center", first=0, before=6, after=2)
        r = p.add_run(title)
        set_run_font(r, size=11, bold=True, all_caps=True)
        # spacer then signature line
        sp = cell.add_paragraph()
        pstyle(sp, align="center", first=0, before=28, after=0)
        sr = sp.add_run("______________________________")
        set_run_font(sr, size=12)
        for line in lines:
            lp = cell.add_paragraph()
            pstyle(lp, align="center", first=0, before=0, after=0)
            lr = lp.add_run(line)
            set_run_font(lr, size=11)

    fill(table.cell(0, 0), left_title, left_lines)
    fill(table.cell(0, 1), right_title, right_lines)
    doc.add_paragraph()


def add_footer_header(doc):
    section = doc.sections[0]
    section.different_first_page_header_footer = True

    # First page footer — draft notice + page
    fp_footer = section.first_page_footer
    fp_footer.is_linked_to_previous = False
    p = fp_footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run("DRAFT FOR COUNSEL REVIEW — NOT YET NOTARIZED  ·  Page ")
    set_run_font(r, size=8, italic=True)
    add_page_field(p)

    # Subsequent header
    header = section.header
    header.is_linked_to_previous = False
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    # bottom border on header
    pPr = hp._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), "6")
    bottom.set(qn("w:space"), "4")
    bottom.set(qn("w:color"), "111111")
    pBdr.append(bottom)
    pPr.append(pBdr)
    r = hp.add_run("MEMORANDUM OF AGREEMENT  ·  Sitex Horizon Pilot  ·  SITEX, Sorsogon City")
    set_run_font(r, size=8, italic=True)

    footer = section.footer
    footer.is_linked_to_previous = False
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run("Confidential draft  ·  For Sitex / SM Sorsogon and transport cooperatives  ·  Page ")
    set_run_font(r, size=8, italic=True)
    add_page_field(fp)


def add_page_field(paragraph):
    run = paragraph.add_run()
    set_run_font(run, size=8, italic=True)
    fldChar1 = OxmlElement("w:fldChar")
    fldChar1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fldChar2 = OxmlElement("w:fldChar")
    fldChar2.set(qn("w:fldCharType"), "end")
    run._r.append(fldChar1)
    run._r.append(instr)
    run._r.append(fldChar2)


def prevent_widow(paragraph):
    pPr = paragraph._p.get_or_add_pPr()
    widow = OxmlElement("w:widowControl")
    widow.set(qn("w:val"), "true")
    pPr.append(widow)


def build():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21.0)
    section.page_height = Cm(29.7)
    section.left_margin = Cm(2.54)
    section.right_margin = Cm(2.54)
    section.top_margin = Cm(2.54)
    section.bottom_margin = Cm(2.54)
    section.header_distance = Cm(1.25)
    section.footer_distance = Cm(1.25)

    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)
    style.element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")

    add_footer_header(doc)

    # —— Draft stamp (first page only, as a boxed paragraph)
    box = doc.add_paragraph()
    pstyle(box, align="center", first=0, before=0, after=12, line=1.1)
    r = box.add_run(
        "DRAFT FOR COUNSEL REVIEW — NOT YET NOTARIZED\n"
        "Complete all blanks, attach Board Resolutions / Secretary’s Certificates, "
        "and acknowledge before a Notary Public in Sorsogon City under the 2004 Rules on Notarial Practice."
    )
    set_run_font(r, size=9, italic=True)
    # box border
    pPr = box._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    for edge in ("top", "left", "bottom", "right"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "8")
        el.set(qn("w:space"), "6")
        el.set(qn("w:color"), "666666")
        pBdr.append(el)
    pPr.append(pBdr)

    add(doc, "REPUBLIC OF THE PHILIPPINES", align="center", bold=True, first=0, after=0, size=12, caps=True)
    add(doc, "Province of Sorsogon", align="center", first=0, after=0, size=12)
    add(doc, "City of Sorsogon", align="center", first=0, after=14, size=12)

    add(doc, "MEMORANDUM OF AGREEMENT", align="center", bold=True, first=0, after=4, size=16, caps=True)
    add(
        doc,
        "For the Pilot Implementation of “Sitex Horizon”\n"
        "A Real-Time Public Bus Arrival Monitoring System\n"
        "at the Sorsogon Integrated Terminal Exchange (SITEX)",
        align="center",
        italic=True,
        first=0,
        after=16,
        size=11,
    )

    add(doc, "KNOW ALL MEN BY THESE PRESENTS:", align="center", bold=True, first=0, after=12, size=12, caps=True)

    add_mixed(
        doc,
        [
            ("This Memorandum of Agreement (the “", False, False),
            ("Agreement", True, False),
            (
                "”) is made and entered into this ____________ day of ____________________ 20______, "
                "at the City of Sorsogon, Philippines, by and among:",
                False,
                False,
            ),
        ],
    )

    add_mixed(
        doc,
        [
            ("________________________________________________, ", False, False),
            (
                "a corporation / entity duly organized and existing under Philippine law, with principal office at "
                "SM City Sorsogon / Sorsogon Integrated Terminal Exchange, Barangay Balogo, Sorsogon City, "
                "represented herein by its authorized representative, ________________________________, "
                "who is duly authorized for this purpose by Board Resolution / Secretary’s Certificate dated "
                "____________________ (a copy of which is attached as ",
                False,
                False,
            ),
            ("Annex “G”", True, False),
            ("), hereinafter referred to as the “", False, False),
            ("FIRST PARTY", True, False),
            ("” or “", False, False),
            ("SITEX / SM SORSOGON", True, False),
            ("”;", False, False),
        ],
    )

    add(doc, "— and —", align="center", first=0, after=8, italic=True)

    add_mixed(
        doc,
        [
            (
                "The public utility bus operators, transport cooperatives, and corporations authorized to use SITEX, "
                "more particularly listed in ",
                False,
                False,
            ),
            ("Annex “E”", True, False),
            (
                ", each duly organized under Philippine law and represented by their respective Chairpersons / "
                "Presidents / authorized signatories, hereinafter collectively referred to as the “",
                False,
                False,
            ),
            ("SECOND PARTY", True, False),
            ("” or the “", False, False),
            ("OPERATORS", True, False),
            ("”;", False, False),
        ],
    )

    add(doc, "— and —", align="center", first=0, after=8, italic=True)

    add_mixed(
        doc,
        [
            ("________________________________, ", False, False),
            (
                "of legal age, Filipino, ____________________ (civil status), with residence at "
                "________________________________________________, Proponent and developer of the Sitex Horizon system, "
                "and presently a candidate for the degree of Master in Business Administration at "
                "St. Louise de Marillac College of Sorsogon (SLMCS), hereinafter referred to as the “",
                False,
                False,
            ),
            ("THIRD PARTY", True, False),
            ("” or the “", False, False),
            ("PROPONENT", True, False),
            ("”.", False, False),
        ],
    )

    add_mixed(
        doc,
        [
            ("The FIRST, SECOND, and THIRD PARTIES are hereinafter referred to individually as a “", False, False),
            ("Party", True, False),
            ("” and collectively as the “", False, False),
            ("Parties", True, False),
            ("”.", False, False),
        ],
    )

    add(doc, "WITNESSETH:  That —", align="center", bold=True, first=0, before=8, after=12, size=12, caps=True)

    whereas(
        doc,
        "the 1987 Constitution of the Republic of the Philippines, Article II, Section 5, declares that "
        "the maintenance of peace and order, the protection of life, liberty, and property, and the promotion "
        "of the general welfare are essential for the enjoyment by all the people of the blessings of democracy;",
    )
    whereas(
        doc,
        "Article II, Section 9 of the same Constitution provides that the State shall promote a just and dynamic "
        "social order that will ensure the prosperity and independence of the nation and free the people from poverty "
        "through policies that provide adequate social services;",
    )
    whereas(
        doc,
        "Article XIII, Section 1 of the Constitution mandates Congress to give highest priority to measures that "
        "protect and enhance the right of all the people to human dignity, reduce social, economic, and political "
        "inequalities, and remove cultural inequities by equitably diffusing wealth and political power for the common good;",
    )
    whereas(
        doc,
        "Republic Act No. 7160, otherwise known as the Local Government Code of 1991, Section 16 (General Welfare Clause), "
        "empowers every local government unit to exercise powers necessary, appropriate, or incidental for its efficient "
        "and effective governance, and those which are essential to the promotion of the general welfare, including the "
        "preservation of comfort and convenience of its inhabitants; and Section 17 requires LGUs to provide basic services "
        "and facilities, including infrastructure supporting transportation;",
    )
    whereas(
        doc,
        "under Section 458 (a)(5)(v) of R.A. 7160 (and the counterpart Section 447 for municipalities), the sanggunian "
        "may establish bus and vehicle stops and terminals or regulate the use of the same by privately-owned vehicles "
        "which serve the public, and regulate the operation of conveyances for hire;",
    )
    whereas(
        doc,
        "Executive Order No. 202, series of 1987, created the Land Transportation Franchising and Regulatory Board (LTFRB) "
        "and, under Section 5(k) thereof, authorized it to require operators of public land transportation to equip, install, "
        "and provide in their utilities and in their stations such devices, equipment, facilities, and operating procedures "
        "as may promote safety, protection, comfort, and convenience of passengers;",
    )
    whereas(
        doc,
        "LTFRB Memorandum Circular No. 2008-013 prescribed the standard classification and guidelines for the establishment, "
        "maintenance, and operation of public transport terminals, including inter-modal terminals, requiring adequate seating "
        "and facilities for waiting passengers;",
    )
    whereas(
        doc,
        "Department of Transportation (DOTr) Department Order No. 2017-011 and related issuances govern off-street terminal "
        "operations and Integrated Terminal Exchanges, encouraging private-sector participation and passenger-oriented terminal "
        "standards; SITEX is the integrated terminal serving Sorsogon City beside SM City Sorsogon, Barangay Balogo;",
    )
    whereas(
        doc,
        "Republic Act No. 4136, the Land Transportation and Traffic Code, regulates motor vehicles and their operation on "
        "Philippine roads, and public utility buses operating to and from SITEX are public services impressed with public interest;",
    )
    whereas(
        doc,
        "Republic Act No. 9520, the Philippine Cooperative Code of 2008, recognizes cooperatives as autonomous associations "
        "with juridical personality authorized to enter into contracts and to provide services to members and the public "
        "consistent with their articles and by-laws;",
    )
    whereas(
        doc,
        "Republic Act No. 7394, the Consumer Act of the Philippines, Article 2 and Title III, protects consumers against "
        "deceptive, unfair, and unconscionable sales acts and practices and upholds the right to information — which, in public "
        "transport, includes timely information on whether a bus on the passenger’s route is coming, delayed, or suspended;",
    )
    whereas(
        doc,
        "Republic Act No. 10121, the Philippine Disaster Risk Reduction and Management Act of 2010, requires timely, accurate, "
        "and people-centered disaster information, including public warnings during typhoons and similar hazards, which this "
        "System will carry on the SITEX public board (including “no travel today” pursuant to LGU ordinance or weather signal);",
    )
    whereas(
        doc,
        "Republic Act No. 10173, the Data Privacy Act of 2012, and its Implementing Rules and Regulations, as well as "
        "National Privacy Commission (NPC) Circular No. 2023-04 (Guidelines on Consent), govern the processing of personal "
        "information, including location data from a driver’s or conductor’s smartphone when such data identifies or makes "
        "identifiable a natural person;",
    )
    add_mixed(
        doc,
        [
            ("WHEREAS", True, False),
            (", Article III, Sections 2 and 3 of the 1987 Constitution, and the Supreme Court in ", False, False),
            ("Ople v. Torres", False, True),
            (
                ", G.R. No. 127685 (23 July 1998), protect informational privacy, so that GPS tracking of a person shall be "
                "lawful only when transparent, limited to a legitimate purpose, proportionate, and supported by a lawful "
                "criterion under Sections 11, 12, and 16 of R.A. 10173;",
                False,
                False,
            ),
        ],
    )
    whereas(
        doc,
        "Republic Act No. 8792, the Electronic Commerce Act of 2000, gives legal recognition to electronic data messages, "
        "electronic documents, and electronic signatures, which covers the System’s digital board, electronic announcements, "
        "and GPS telemetry;",
    )
    whereas(
        doc,
        "Republic Act No. 386, the Civil Code of the Philippines, Articles 1159, 1305, 1306, and 1315, provides that "
        "obligations arising from contracts have the force of law between the parties; that a contract is a meeting of minds; "
        "that parties may establish such stipulations as they may deem convenient, provided they are not contrary to law, "
        "morals, good customs, public order, or public policy; and that contracts are perfected by mere consent;",
    )
    whereas(
        doc,
        "waiting passengers at SITEX presently have no reliable public means of knowing whether a bus bound for their "
        "municipality is en route, delayed, or cancelled, causing uncertainty in travel time to the sixteen (16) municipalities "
        "of Sorsogon;",
    )
    add_mixed(
        doc,
        [
            ("WHEREAS", True, False),
            (", the THIRD PARTY has designed and offered, ", False, False),
            ("free of royalty for use at SITEX", True, False),
            (
                ", the Sitex Horizon system (the “System”) — a public terminal board and companion driver application that "
                "computes expected arrival from remaining official road distance and the live speed reported by the bus’s "
                "on-duty smartphone GPS, and that carries Sitex-editable public announcements and a passenger-report channel "
                "to Sitex and the Operators;",
                False,
                False,
            ),
        ],
    )
    whereas(
        doc,
        "the Parties desire to pilot the System at SITEX for the benefit of the riding public of Sorsogon, subject to "
        "data-privacy, safety, and franchise rules, without transferring ownership of any Certificate of Public Convenience "
        "(CPC) or terminal concession;",
    )

    add_mixed(
        doc,
        [
            ("NOW, THEREFORE", True, False),
            (
                ", for and in consideration of the foregoing premises and the mutual covenants hereinafter set forth, "
                "the Parties hereby agree as follows:",
                False,
                False,
            ),
        ],
        first=1.25,
        before=6,
        after=12,
    )

    # ARTICLES
    article(doc, "I", "Title and Nature")
    add(
        doc,
        "This Agreement shall be known as the Sitex Horizon Pilot Implementation Agreement. It is a binding "
        "memorandum of agreement under Articles 1305, 1306, and 1315 of the Civil Code. Nothing herein shall be "
        "construed as a joint venture, partnership, agency to sell franchises, or employment contract, except as "
        "expressly stated. The FIRST PARTY remains the operator of the terminal premises; the SECOND PARTY remains "
        "solely responsible for its CPCs, vehicles, and crews; the THIRD PARTY remains the author of the System.",
    )

    article(doc, "II", "Definition of Terms")
    add(doc, "For purposes of this Agreement, the following terms shall mean:", first=1.25)
    defs = [
        ("System", "Sitex Horizon, including the public Terminal board, Passenger view, Driver / conductor application, Admin announcement desk, advertisement slot, and Report desk, as described in Annex “A”."),
        ("SITEX", "the Sorsogon Integrated Terminal Exchange, Barangay Balogo, Sorsogon City, adjacent to SM City Sorsogon."),
        ("Live Fix", "a time-stamped latitude, longitude, and speed reading obtained from the GNSS / GPS of the on-duty driver’s or conductor’s smartphone, with the bus plate as the public identifier."),
        ("ETA", "estimated time of arrival at SITEX, computed as remaining official road kilometers of the assigned municipality divided by the current speed in kilometers per hour, continuously recomputed when speed changes."),
        ("On duty", "the interval from the crew’s “Start trip” until “End trip” on the Driver application, and in no case after the crew has been signed off or the bus has been grounded."),
        ("Personal data", "has the meaning in Section 3 of R.A. 10173. The public board shall display the bus plate, route, operator name, speed class, and ETA — not the personal name, photograph, phone number, or home address of any driver or conductor."),
    ]
    for term, meaning in defs:
        add_mixed(
            doc,
            [('"' + term + '"', True, False), (" means " + meaning, False, False)],
            first=1.25,
            after=6,
        )

    article(doc, "III", "Purpose and Scope")
    add(doc, "The purpose of this Agreement is to:", first=1.25)
    lettered(doc, "a", "Provide waiting passengers at SITEX a public, free-of-charge view of whether a bus for their municipality is coming, how far it is, and when it is expected, covering the sixteen (16) municipalities listed in Annex “C”;")
    lettered(doc, "b", "Allow Sitex / SM Sorsogon to publish live transport announcements (including typhoon, LGU travel bans, and limited-bus operations) on a large public board, with emergency hotlines when required;")
    lettered(doc, "c", "Give Operators a channel for passenger experience reports, which Sitex shall forward to the concerned cooperative or corporation head;")
    lettered(doc, "d", "Pilot the System first on the routes in Annex “F”, then expand by written addendum;")
    lettered(doc, "e", "Operate only as a passenger-information and terminal-management aid. It does not replace LTFRB timetables, CPCs, fare matrices, or traffic-enforcement powers of the LTO, PNP, or LGU.")

    article(doc, "IV", "Legal Basis")
    add(
        doc,
        "This Agreement is entered into pursuant to, and shall be construed consistently with, the following authorities:",
    )
    add_table(
        doc,
        ["Authority", "Provision and bearing on this Pilot"],
        [
            [
                "1987 Constitution, Art. II, Sec. 5 and Sec. 9; Art. XIII, Sec. 1",
                "General welfare, social services, and social justice — public information that reduces uncertainty of homeward travel.",
            ],
            [
                "1987 Constitution, Art. III, Secs. 1, 2 and 3; Ople v. Torres, G.R. No. 127685 (1998)",
                "Due process and informational privacy. GPS of a natural person is processed only with a lawful basis, on duty, and minimized.",
            ],
            [
                "Civil Code (R.A. 386), Arts. 1159, 1305, 1306, 1315, 1370",
                "Contracts have the force of law between the parties; autonomy of contracts; perfection by consent; literal interpretation of clear stipulations.",
            ],
            [
                "R.A. 7160, Secs. 16, 17, 447 / 458 (a)(5)(v)",
                "LGU general welfare; basic services; power to establish or regulate bus terminals and conveyances for hire. LGU travel-suspension ordinances during typhoons shall be honored on the board.",
            ],
            [
                "E.O. 202 (1987), Sec. 5(k); LTFRB M.C. No. 2008-013; DOTr D.O. No. 2017-011",
                "Passenger safety, comfort, and convenience at terminals; Integrated Terminal Exchange standards; private-sector participation in off-street terminals.",
            ],
            [
                "R.A. 4136 (Land Transportation and Traffic Code)",
                "Regulation of motor vehicles. The System does not authorize illegal operation of a PUV.",
            ],
            [
                "R.A. 9520 (Cooperative Code of 2008)",
                "Cooperatives may contract and bind members consistent with by-laws; Operator consent and crew briefing are through the cooperative / corporation.",
            ],
            [
                "R.A. 7394 (Consumer Act), Art. 2",
                "Passenger right to information on the availability and timing of the transport service they wait for.",
            ],
            [
                "R.A. 10121 (DRRM Act of 2010)",
                "People-centered disaster information. The board shall carry Sitex-approved typhoon / no-travel notices and hotlines.",
            ],
            [
                "R.A. 10173, Secs. 3, 11, 12, 16, 20; IRR; NPC Circular No. 2023-04",
                "Lawful processing of location data: transparency, legitimate purpose, proportionality; consent or other Sec. 12 criterion; data-subject rights; security; freely given, specific, informed, time-bound consent for on-duty GPS.",
            ],
            [
                "R.A. 8792 (E-Commerce Act)",
                "Legal recognition of electronic documents, data messages, and the digital board / telemetry.",
            ],
            [
                "Labor Code (P.D. 442, as amended)",
                "Management prerogative of Operators over member-drivers, as limited by the DPA: on-duty use of the Driver app as a work tool; off-duty tracking prohibited.",
            ],
            [
                "Batas Pambansa Blg. 344; R.A. 7277; R.A. 9994",
                "Accessibility and protection of PWDs and senior citizens — large, readable public information at the terminal.",
            ],
            [
                "R.A. 11311",
                "Passenger welfare facilities at terminals. The System is an additional passenger-information facility, not a substitute for restrooms or seating required by LTFRB.",
            ],
        ],
        col_widths=[7.2, 9.2],
    )

    article(doc, "V", "Obligations of the First Party\n(Sitex / SM Sorsogon)")
    add(doc, "The FIRST PARTY shall:")
    lettered(doc, "a", "Designate SITEX as the official venue of the public board, and provide at least one (1) powered display with internet (wifi or LTE) at a waiting area visible to passengers;")
    lettered(doc, "b", "Appoint a Sitex dispatcher / administrator who alone may publish announcements, weather status, and advertisement slots, and who shall forward passenger reports to the concerned Operator head within one (1) operational day;")
    lettered(doc, "c", "Keep Admin credentials confidential. The public URL of the Terminal and Passenger views may be posted; the Admin function shall not be left open to the general public;")
    lettered(doc, "d", "Honor LGU ordinances, PAGASA signals, and PNP / CDRRMO guidance in announcements, using the System’s Critical / Caution / Info levels, including the public message “INGAT PO ANG LAHAT” and hotlines when travel is suspended or limited;")
    lettered(doc, "e", "Not charge waiting passengers any fee to view the board;")
    lettered(doc, "f", "Act as personal information controller (PIC), jointly with the SECOND PARTY as to crew location data, for processing done on SITEX premises, and maintain a contact point for data-subject requests under Section 16 of R.A. 10173;")
    lettered(doc, "g", "Cause this Agreement and the privacy notice (Annex “B”) to be posted at the information desk.")

    article(doc, "VI", "Obligations of the Second Party\n(Operators)")
    add(doc, "Each Operator shall:")
    lettered(doc, "a", "Enroll the plates that will participate, matching the CPC / authorized units using SITEX;")
    lettered(doc, "b", "Brief drivers and conductors that the Driver application uses the phone’s built-in GNSS / GPS (not a separate “GPS number”), during an on-duty trip only, and that speed from that fix updates the public ETA;")
    lettered(doc, "c", "Obtain from each participating crew member a signed Informed Consent in the form of Annex “B” before the first Live Fix, in Filipino or English, as the crew prefers. Consent shall be freely given, specific, informed, and evidenced in writing or recorded electronic means, pursuant to Section 3(b) of R.A. 10173 and NPC Circular No. 2023-04;")
    lettered(doc, "d", "Instruct crews: Start trip before leaving the origin or SITEX bay; Share live GPS while on duty; End trip upon arrival or grounding; keep mobile data on; never share GPS off duty or from home;")
    lettered(doc, "e", "Not retaliate against a crew member who withdraws consent; the unit may then be shown as “no live GPS” rather than a false ETA;")
    lettered(doc, "f", "Receive and act on passenger reports forwarded by Sitex, and name an official contact for that purpose;")
    lettered(doc, "g", "Remain solely liable for the safe operation of its units, fares, crews, and franchise conditions. The System is information only.")

    article(doc, "VII", "Obligations of the Third Party\n(Proponent)")
    add(doc, "The THIRD PARTY shall:")
    lettered(doc, "a", "Grant the FIRST PARTY a royalty-free, non-exclusive, non-transferable license to use the System at SITEX for the Term, for public passenger information and terminal administration, consistent with the Proponent’s offer that the System is given for the people of Sorsogon;")
    lettered(doc, "b", "Retain intellectual-property ownership of Sitex Horizon (software, design, documentation), except for SITEX / SM marks, which remain with their owners and are used only with permission for identification of the terminal;")
    lettered(doc, "c", "Assist in training Sitex staff and pilot crews, and in correcting ETA error against measured arrivals during the Pilot;")
    lettered(doc, "d", "Not sell passenger or crew personal data. Advertisements on the board are limited to Sitex-approved public creatives;")
    lettered(doc, "e", "Cooperate in any NPC inquiry and in implementing security measures under Section 20 of R.A. 10173;")
    lettered(doc, "f", "This license does not make the Proponent the employer of any driver, nor the concessionaire of SITEX.")

    article(doc, "VIII", "Data Privacy, GPS, and Proportionality")
    add_mixed(doc, [("Section 1. Lawful criteria. ", True, False), ("Processing of a Live Fix is based on:", False, False)], first=1.25)
    lettered(doc, "i", "the freely given, specific, informed, and recorded consent of the driver / conductor (R.A. 10173, Sec. 12(a); NPC Circular No. 2023-04); and/or")
    lettered(doc, "ii", "necessity for the performance of a contract to which the crew or Operator is party, namely the on-duty provision of a public transport service with passenger information (Sec. 12(b)); and")
    lettered(doc, "iii", "legitimate passenger-safety and terminal-management purpose compatible with E.O. 202, Sec. 5(k), and R.A. 7394’s right to information — provided that processing remains proportionate (Sec. 11).")
    add_mixed(doc, [("Section 2. What is collected. ", True, False), ("During an on-duty trip only: latitude, longitude, speed, heading if available, accuracy, timestamp, bus plate, route / municipality, and operator name. Not collected: government ID numbers, home address, off-duty location, passenger names, payment data, or continuous audio/video of the cab.", False, False)])
    add_mixed(doc, [("Section 3. What the public sees. ", True, False), ("Plate, destination, municipality and ZIP, official road kilometers, live or last speed, ETA, and status (en route / delayed / arrived / suspended). The crew’s personal name shall not appear on the public board.", False, False)])
    add_mixed(doc, [("Section 4. Duration. ", True, False), ("Consent is time-bound to the Term of this Agreement and to each on-duty trip. A Live Fix older than thirty (30) minutes without refresh shall not be presented as current. Raw coordinates shall not be retained longer than ninety (90) days unless a lawful investigation or NPC / court process requires longer holding, after which they shall be deleted or anonymized.", False, False)])
    add_mixed(doc, [("Section 5. Withdrawal and rights. ", True, False), ("The data subject may withdraw consent, access, correct, or object under Section 16 of R.A. 10173 through the Operator and the Sitex privacy contact. Withdrawal shall not affect the lawfulness of processing before withdrawal.", False, False)])
    add_mixed(doc, [("Section 6. Security and sharing. ", True, False), ("Access to Admin and raw telemetry is restricted to Sitex dispatch and the concerned Operator. There shall be no sale of personal data. Sharing with PNP, CDRRMO, or LTFRB shall be only upon lawful request or in a genuine emergency to protect vital interests (Sec. 12(c)).", False, False)])
    add_mixed(doc, [("Section 7. Personal phones (BYOD). ", True, False), ("Where the crew uses a personal smartphone, participation is voluntary, requires Annex “B”, and shall not extend to personal photos, messages, or off-duty movement. The Operator shall, where practicable, prefer a unit-assigned device.", False, False)])
    add_mixed(doc, [("Section 8. Passenger reports. ", True, False), ("Reports are operational complaints (category, route, short note, ticket number). The Parties shall not require a passenger’s real name. Free-text notes shall be limited and used only to improve service.", False, False)])

    article(doc, "IX", "Public Announcements and Emergencies")
    add(
        doc,
        "Only the FIRST PARTY (or a person it designates in writing) may publish to all screens. Critical notices "
        "(typhoon, LGU ordinance of no travel, grounded fleet) shall occupy the large announcement area and include "
        "hotlines of PNP, CDRRMO, Bureau of Fire Protection, and Sitex. The Parties acknowledge that during disasters, "
        "R.A. 10121 prefers timely public warning over commercial messages; advertisements shall yield to Critical notices.",
    )

    article(doc, "X", "Advertisements")
    add(
        doc,
        "The FIRST PARTY may sell or grant advertisement slots on the board, provided creatives are lawful, not contrary "
        "to morals or public policy (Civil Code Art. 1306), and are paused during Critical notices. Revenue, if any, belongs "
        "to the FIRST PARTY unless the Parties execute a separate revenue-share addendum. The THIRD PARTY claims no "
        "advertisement revenue under this royalty-free license.",
    )

    article(doc, "XI", "Pilot, Accuracy, and No Warranty of Exact Minute")
    add(
        doc,
        "The System computes ETA from official road distance and the last known speed of that plate. Traffic, weather, "
        "detours, and GPS error may cause variance. The Parties shall, during the first sixty (60) days of the Pilot "
        "(Annex “F”), compare board ETA with actual bay arrival and adjust road-kilometer tables if a route is systematically "
        "early or late. The board shall not be represented as an LTFRB-official timetable. No Party warrants a particular "
        "minute of arrival.",
    )

    article(doc, "XII", "Intellectual Property, Marks, and Further Development")
    add(
        doc,
        "Sitex Horizon source and design remain with the THIRD PARTY. SM / SITEX names and the terminal photograph are used "
        "only to identify the actual place of public viewing, with the FIRST PARTY’s permission. The THIRD PARTY may use "
        "anonymized operational statistics for the MBA thesis at SLMCS, without identifying any crew member. Further "
        "development after the Pilot may be agreed in writing.",
    )

    article(doc, "XIII", "Term, Renewal, and Termination")
    add(
        doc,
        "This Agreement shall have a term of two (2) years from the date of notarization (the “Term”), unless sooner "
        "terminated. It shall automatically renew for successive one-year periods unless a Party gives thirty (30) days’ "
        "written notice. Any Party may terminate for material breach remaining uncured after fifteen (15) days’ notice, "
        "or immediately if continued GPS processing would violate R.A. 10173. Upon termination, Live Fixes shall cease; "
        "public archives older than the retention period shall be deleted; and the license to use the System at SITEX shall "
        "end, without prejudice to the FIRST PARTY’s right to return to printed schedules.",
    )

    article(doc, "XIV", "Liability and Indemnity")
    add(
        doc,
        "Each Operator remains solely responsible for accidents, CPC violations, and labor claims involving its units and "
        "crews. The FIRST PARTY remains responsible for the terminal premises. The THIRD PARTY is responsible for software "
        "defects it does not cure within a reasonable time after written notice. No Party shall be liable to another for "
        "indirect or consequential damages. Nothing herein waives liability for fraud, willful misconduct, or violation of "
        "R.A. 10173. Indemnity is only to the extent of the indemnifying Party’s own fault.",
    )

    article(doc, "XV", "Force Majeure")
    add(
        doc,
        "Failure to perform due to typhoon, flood, earthquake, epidemic, internet-backbone failure, or government "
        "prohibition shall not be a breach for the duration of the event. The FIRST PARTY shall nonetheless endeavor to "
        "publish a Critical notice of no or limited travel.",
    )

    article(doc, "XVI", "Dispute Resolution and Venue")
    add(
        doc,
        "The Parties shall first attempt amicable settlement, then mediation at the City of Sorsogon. If unresolved, "
        "exclusive venue shall be the proper courts of Sorsogon City, Province of Sorsogon, to the exclusion of all others. "
        "This Agreement is governed by the laws of the Republic of the Philippines.",
    )

    article(doc, "XVII", "Miscellaneous")
    add_mixed(doc, [("Separability. ", True, False), ("If any stipulation is declared void, the remainder shall remain effective (Civil Code Art. 1420, in so far as applicable).", False, False)])
    add_mixed(doc, [("Amendment. ", True, False), ("No amendment except in a written instrument signed by the Parties and, when required, notarized.", False, False)])
    add_mixed(doc, [("Entire agreement. ", True, False), ("This instrument and its Annexes constitute the entire agreement as to the Pilot.", False, False)])
    add_mixed(doc, [("Notices. ", True, False), ("Written notices shall be sent to the addresses first above written, or to official emails designated in Annex “E”.", False, False)])
    add_mixed(doc, [("Counterparts. ", True, False), ("Signed in any number of counterparts, including electronic counterparts recognized under R.A. 8792, each of which is an original.", False, False)])
    add_mixed(doc, [("Authority. ", True, False), ("Each signatory warrants authority (board resolution / secretary’s certificate / cooperative board resolution).", False, False)])
    add_mixed(doc, [("Language. ", True, False), ("English is the governing text. A Filipino translation of Annex “B” shall be offered to every crew member.", False, False)])
    add_mixed(doc, [("Filing. ", True, False), ("A certified copy may be furnished to the City Government of Sorsogon, the LTFRB Regional Office, and the Sorsogon PDRRMO for information. Filing does not make those offices parties unless they later accede in writing.", False, False)])

    add_mixed(
        doc,
        [
            ("IN WITNESS WHEREOF", True, False),
            (
                ", the Parties have hereunto set their hands on the date and at the place first above written.",
                False,
                False,
            ),
        ],
        first=1.25,
        before=12,
        after=16,
    )

    sig_block(
        doc,
        "FIRST PARTY\nSitex / SM Sorsogon",
        [
            "Authorized Representative",
            "Name: _______________________________",
            "Position: ____________________________",
            "Gov’t ID: ___________________________",
            "Date: _______________________________",
        ],
        "THIRD PARTY\nProponent, Sitex Horizon",
        [
            "Proponent",
            "Name: _______________________________",
            "Gov’t ID: ___________________________",
            "Date: _______________________________",
            " ",
        ],
    )

    add(doc, "SECOND PARTY — Operators", align="center", bold=True, first=0, before=8, after=4, caps=True)
    add(doc, "(Repeat as needed; the complete list is Annex “E”)", align="center", italic=True, first=0, after=8, size=10)

    sig_block(
        doc,
        "Cooperative / Corporation",
        [
            "________________________________",
            "Chairperson / President",
            "Name: _______________________________",
            "Gov’t ID: ___________________________",
            "Date: _______________________________",
        ],
        "Cooperative / Corporation",
        [
            "________________________________",
            "Chairperson / President",
            "Name: _______________________________",
            "Gov’t ID: ___________________________",
            "Date: _______________________________",
        ],
    )

    add(doc, "SIGNED IN THE PRESENCE OF:", align="center", bold=True, first=0, before=10, after=8, caps=True)
    sig_block(
        doc,
        "Witness",
        ["Name: _______________________________", "Address / ID: _______________________", "Date: _______________________________"],
        "Witness",
        ["Name: _______________________________", "Address / ID: _______________________", "Date: _______________________________"],
    )

    # ACKNOWLEDGMENT — new page
    doc.add_page_break()
    add(doc, "ACKNOWLEDGMENT", align="center", bold=True, first=0, after=12, size=14, caps=True)

    add(doc, "REPUBLIC OF THE PHILIPPINES )", align="left", first=0, after=0)
    add_mixed(
        doc,
        [
            ("CITY OF SORSOGON", False, False),
            ("                            ) S.S.", True, False),
        ],
        align="left",
        first=0,
        after=10,
    )

    add(
        doc,
        "BEFORE ME, a Notary Public for and in the City of Sorsogon, Philippines, this ________ day of "
        "____________________ 20______, personally appeared the following persons, who presented the competent "
        "evidence of identity indicated below, and who are identified by me through said competent evidence of identity "
        "in accordance with the 2004 Rules on Notarial Practice:",
    )

    add_table(
        doc,
        ["Name", "Capacity / Party", "Competent evidence of identity", "Date / place issued"],
        [
            ["", "First Party", "", ""],
            ["", "Second Party", "", ""],
            ["", "Second Party", "", ""],
            ["", "Third Party", "", ""],
        ],
        col_widths=[4.0, 3.6, 5.0, 3.8],
    )
    # extra blank rows height — already empty cells

    add(
        doc,
        "known to me and to me known to be the same persons who executed the foregoing Memorandum of Agreement "
        "consisting of __________ pages, including this Acknowledgment and the Annexes, signed by the Parties and their "
        "witnesses on each and every page, and they acknowledged to me that the same is their free and voluntary act "
        "and deed and that of the entities they represent.",
    )
    add(
        doc,
        "WITNESS MY HAND AND NOTARIAL SEAL on the date and at the place first above written.",
        first=1.25,
        before=6,
        after=16,
    )

    add(doc, "Doc. No. ______;", align="left", first=0, after=0)
    add(doc, "Page No. ______;", align="left", first=0, after=0)
    add(doc, "Book No. ______;", align="left", first=0, after=0)
    add(doc, "Series of 20______.", align="left", first=0, after=20)

    add(doc, "________________________________", align="center", first=0, after=0)
    add(doc, "Notary Public", align="center", bold=True, first=0, after=4)
    add(
        doc,
        "Until 31 December 20______    ·    Roll No. __________    ·    IBP No. __________\n"
        "PTR No. __________    ·    MCLE Compliance No. __________    ·    Commission No. __________",
        align="center",
        first=0,
        after=8,
        size=10,
    )

    # ANNEX A
    doc.add_page_break()
    annex_head(doc, "A", "Description of the Sitex Horizon System")
    add(
        doc,
        "Sitex Horizon is a web-based public information system for SITEX. Its screens are: "
        "(1) Terminal — public board over an HD view of the SITEX building, live map of Sorsogon, next arrivals, "
        "announcement, and advertisements; (2) Passenger — choose a municipality, see the next bus and ETA; "
        "(3) Driver / conductor — select plate, start/end trip, share live GPS; (4) Admin — announcements, weather, "
        "ads, report forwarding; (5) Report — anonymous operational complaint with a ticket number.",
    )
    add_mixed(
        doc,
        [
            ("Accuracy method. ", True, False),
            (
                "The System does not use a “GPS number.” It uses the phone’s built-in GNSS (Android and iOS Geolocation: "
                "latitude, longitude, coords.speed). Remaining official road kilometers for that municipality from SITEX, "
                "divided by current speed, equals ETA in minutes. When velocity of that particular bus number changes, "
                "ETA is recomputed. Official road distances are those in Annex “C”. Internet connectivity is required for "
                "a Live Fix on a driver phone to appear on the Sitex TV and on other passenger phones.",
                False,
                False,
            ),
        ],
    )

    # ANNEX B
    doc.add_page_break()
    annex_head(doc, "B", "Informed Consent — On-Duty GPS\n(R.A. 10173 / NPC Circular No. 2023-04)")
    add(
        doc,
        "I, ________________________________, of legal age, employed / member as driver / conductor of plate no. "
        "______________ under ________________________________ (Operator), after having been informed in a language "
        "I understand, hereby freely give my specific consent to the processing of my phone’s GNSS / GPS location and "
        "speed only while I am on duty on a trip displayed at SITEX through Sitex Horizon.",
    )
    add(doc, "I understand that:", first=1.25)
    lettered(doc, "1", "Purpose — so waiting passengers can see if my bus is coming and the estimated arrival; Sitex / the Operator may also see it for dispatch and safety.")
    lettered(doc, "2", "Data — location, speed, time, plate, route. Not my name on the public TV. Not my movement after I tap End trip.")
    lettered(doc, "3", "I can refuse or withdraw without losing my job as a legal matter under the Data Privacy Act; the bus may then show as “no live GPS.”")
    lettered(doc, "4", "Retention — raw location not more than ninety (90) days unless lawfully required longer.")
    lettered(doc, "5", "Controllers — Sitex / SM Sorsogon and my Operator; I may write them to access, correct, or erase under Sec. 16, R.A. 10173, or complain to the National Privacy Commission.")
    lettered(doc, "6", "This consent is time-bound to the Sitex Horizon Pilot Term and to each on-duty trip.")
    add(doc, "Signed this ________ day of ____________________ 20______ at ________________________, Sorsogon.", first=1.25, before=8)
    sig_block(
        doc,
        "Crew member",
        ["Name / signature", "Date: _______________________________"],
        "Operator witness",
        ["Name / position", "Date: _______________________________"],
    )
    add_mixed(
        doc,
        [
            ("Filipino (buod): ", True, True),
            (
                "Sumasang-ayon akong ibahagi ang GPS ng aking telepono habang ako ay naka-duty lamang, upang makita ng "
                "mga pasahero sa SITEX kung paparating ang aming bus. Hindi lalabas ang aking pangalan sa TV. Puwede kong "
                "bawiin ang pagsang-ayon. Hindi susubaybayan ang kinaroroonan ko pagkatapos ng biyahe.",
                False,
                True,
            ),
        ],
        first=0,
        after=8,
        size=11,
    )

    # ANNEX C
    doc.add_page_break()
    annex_head(doc, "C", "Municipalities of Sorsogon — ZIP and road kilometers from SITEX (Balogo)")
    add(
        doc,
        "Distances below are the System’s operational road-kilometer table for ETA, measured from SITEX, Barangay Balogo. "
        "They shall be adjusted by written addendum if field measurement during the Pilot shows a consistent error. "
        "ZIP codes are those commonly used in Sorsogon. Attach a printout of the System table, initialed by the Parties, as Annex “C-1”.",
        size=11,
    )
    add_table(
        doc,
        ["Municipality / City", "ZIP", "Road km from SITEX (operational)"],
        [
            ["Sorsogon City", "4700", "3.20 km (city proper)"],
            ["Bacon", "4701", "10.70 km"],
            ["Casiguran", "4702", "19.03 km"],
            ["Juban", "4703", "23.05 km"],
            ["Bulusan", "4704", "42.52 km"],
            ["Magallanes", "4705", "48.13 km"],
            ["Bulan", "4706", "63.09 km"],
            ["Irosin", "4707", "43.35 km"],
            ["Matnog", "4708", "66.64 km"],
            ["Sta. Magdalena", "4709", "71.97 km"],
            ["Gubat", "4710", "19.16 km"],
            ["Prieto Diaz", "4711", "34.40 km"],
            ["Barcelona", "4712", "27.13 km"],
            ["Castilla", "4713", "25.11 km"],
            ["Pilar", "4714", "55.69 km"],
            ["Donsol", "4715", "66.47 km"],
        ],
        col_widths=[6.5, 3.0, 7.0],
    )

    # ANNEX D
    doc.add_page_break()
    annex_head(doc, "D", "Personal data processing inventory (R.A. 10173, Sec. 11)")
    add_table(
        doc,
        ["Data", "Source", "Purpose", "Lawful basis", "Retention", "Recipients"],
        [
            [
                "Lat, lng, speed, time",
                "Crew phone GNSS while on duty",
                "Public ETA and dispatch",
                "Consent (Sec. 12(a)); contract (Sec. 12(b)); proportionality (Sec. 11)",
                "90 days raw",
                "Sitex dispatch; Operator; public sees plate + ETA only",
            ],
            [
                "Plate, route, operator",
                "Operator enrollment",
                "Identify the bus, not the person",
                "Legitimate terminal operation",
                "Term of Agreement",
                "Public board",
            ],
            [
                "Report ticket, category, route, short note",
                "Passenger (anonymous by default)",
                "Service quality; forward to Operator",
                "Legitimate interest / public service, minimized",
                "1 year",
                "Sitex; named Operator head",
            ],
            [
                "Announcement text",
                "Sitex Admin",
                "Public warning and service status",
                "R.A. 10121; LGU police power",
                "Until superseded",
                "Public",
            ],
        ],
    )

    # ANNEX E
    doc.add_page_break()
    annex_head(doc, "E", "Schedule of Operators (Second Party)")
    add_table(
        doc,
        ["Registered name of cooperative / corporation", "Authorized representative", "Plates enrolled (attach CPC list)", "Official email / mobile for reports", "Signature / date"],
        [["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""], ["", "", "", "", ""]],
    )

    # ANNEX F
    annex_head(doc, "F", "Pilot routes (first sixty days)")
    add_mixed(
        doc,
        [
            (
                "Unless the Parties agree otherwise in writing, the Pilot shall begin with three (3) routes only: ",
                False,
                False,
            ),
            ("Gubat (4710), Bulan (4706), and Matnog (4708)", True, False),
            (
                ". Expansion to the remaining municipalities in Annex “C” requires a signed addendum and crew consents "
                "for the additional plates.",
                False,
                False,
            ),
        ],
    )
    add(doc, "Pilot start date: ____________________     Review date (day 60): ____________________", first=0, align="left")
    add(
        doc,
        "Success measures: (i) board visible during operating hours; (ii) at least one Live Fix per enrolled plate per "
        "operating day; (iii) Sitex log of ETA vs actual arrival; (iv) zero off-duty tracking incidents; (v) reports "
        "forwarded within one operational day.",
    )

    # ANNEX G
    annex_head(doc, "G", "Secretary’s Certificate / Board Resolution")
    add(
        doc,
        "[Attach the FIRST PARTY’s board resolution or secretary’s certificate authorizing the named signatory to bind "
        "Sitex / SM Sorsogon. Attach each SECOND PARTY cooperative board resolution or secretary’s certificate. Attach "
        "government-issued IDs of all signatories.]",
        italic=True,
    )
    add(
        doc,
        "Note to counsel. Confirm the exact juridical name of the SITEX / SM City Sorsogon terminal operator (mall owner, "
        "terminal concessionaire, or both) before filling the Parties. Confirm whether the City Government of Sorsogon "
        "should accede as a concurring party for typhoon travel bans. Register a Data Protection Officer contact if the "
        "FIRST PARTY is a PIC required to register a data-processing system with the NPC. This draft is not legal advice.",
        italic=True,
        size=11,
        first=1.25,
    )

    doc.save(OUT)
    import shutil

    shutil.copy(OUT, "/workspace/public/legal/SITEX-HORIZON-MOA.docx")
    print("wrote", OUT)


def annex_head(doc, letter, title):
    add(doc, f"ANNEX “{letter}”", align="center", bold=True, first=0, before=4, after=4, size=14, caps=True)
    add(doc, title, align="center", italic=True, first=0, after=12, size=12)


if __name__ == "__main__":
    build()
