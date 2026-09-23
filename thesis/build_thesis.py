#!/usr/bin/env python3
"""CHED-aligned MBA thesis manuscript for SLMCS (Saint Louise de Marillac College of Sorsogon)."""

from pathlib import Path

from docx import Document
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT, WD_TAB_LEADER
from docx.oxml import OxmlElement
from docx.oxml.ns import qn, nsmap
from docx.shared import Inches, Pt, Cm, Emu, Mm, RGBColor
from docx.enum.section import WD_ORIENT, WD_SECTION

OUT = Path("/workspace/public/Sitex-Horizon-MBA-Thesis-SLMCS.docx")
COPIES = [
    Path("/workspace/artifacts/Sitex_Horizon_MBA_Thesis_SLMCS.docx"),
    Path("/workspace/Sitex_Horizon_MBA_Thesis_SLMCS.docx"),
]
PHOTO = Path("/workspace/public/sitex-photo.jpg")
TITLE = (
    "DEVELOPMENT OF SITEX HORIZON: A REAL-TIME BUS MONITORING AND "
    "PASSENGER INFORMATION SYSTEM FOR THE SORSOGON INTEGRATED TERMINAL EXCHANGE"
)
SCHOOL = "SAINT LOUISE DE MARILLAC COLLEGE OF SORSOGON"
PROPONENT = "[NAME OF THE PROPONENT]"
DEGREE = "MASTER IN BUSINESS ADMINISTRATION"
YEAR = "2026"


def set_run_font(run, name="Times New Roman", size=12, bold=False, italic=False, all_caps=False):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    run.font.size = Pt(size)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(0, 0, 0)
    if all_caps:
        run.font.all_caps = True


def set_paragraph_format(p, *, align="justify", first_indent=None, space_before=0, space_after=0, line=2.0, keep=False):
    pf = p.paragraph_format
    pf.space_before = Pt(space_before)
    pf.space_after = Pt(space_after)
    pf.line_spacing_rule = WD_LINE_SPACING.DOUBLE if line == 2.0 else WD_LINE_SPACING.SINGLE
    if line == 1.5:
        pf.line_spacing = 1.5
        pf.line_spacing_rule = WD_LINE_SPACING.ONE_POINT_FIVE
    if line == 1.0:
        pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
    if first_indent is not None:
        pf.first_line_indent = Inches(first_indent)
    else:
        pf.first_line_indent = Inches(0)
    pf.alignment = {
        "left": WD_ALIGN_PARAGRAPH.LEFT,
        "center": WD_ALIGN_PARAGRAPH.CENTER,
        "right": WD_ALIGN_PARAGRAPH.RIGHT,
        "justify": WD_ALIGN_PARAGRAPH.JUSTIFY,
    }[align]
    if keep:
        pf.keep_with_next = True


def add_text(p, text, **font):
    run = p.add_run(text)
    set_run_font(run, **font)
    return run


def body(doc, text, indent=True):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="justify", first_indent=0.5 if indent else 0)
    add_text(p, text)
    return p


def centered(doc, text, *, size=12, bold=False, italic=False, space_before=0, space_after=0, line=2.0):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", first_indent=0, space_before=space_before, space_after=space_after, line=line)
    add_text(p, text, size=size, bold=bold, italic=italic)
    return p


def blank(doc, n=1):
    for _ in range(n):
        p = doc.add_paragraph()
        set_paragraph_format(p, align="center", line=2.0)
        add_text(p, "")


def heading_chapter(doc, number, title):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", space_before=0, space_after=0)
    add_text(p, f"Chapter {number}", size=12, bold=True)
    p2 = doc.add_paragraph()
    set_paragraph_format(p2, align="center", space_before=0, space_after=12)
    add_text(p2, title.upper(), size=12, bold=True)
    return p2


def heading_section(doc, text):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, space_before=12, space_after=0, keep=True)
    add_text(p, text, bold=True)
    return p


def heading_sub(doc, text):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, space_before=6, space_after=0, keep=True)
    add_text(p, text, bold=True, italic=True)
    return p


def bullet(doc, text, level=0):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="justify", first_indent=0.5 + level * 0.25)
    add_text(p, f"{'    ' * level}{text}")
    return p


def caption(doc, text):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", first_indent=0, space_before=6, space_after=12, line=1.0)
    add_text(p, text, size=11, italic=True)
    return p


def add_page_number(section, roman=False, restart=False):
    footer = section.footer
    footer.is_linked_to_previous = False
    p = footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.clear()
    run = p.add_run()
    set_run_font(run, size=12)

    fld1 = OxmlElement("w:fldChar")
    fld1.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld2 = OxmlElement("w:fldChar")
    fld2.set(qn("w:fldCharType"), "end")
    run._r.append(fld1)
    run._r.append(instr)
    run._r.append(fld2)

    sectPr = section._sectPr
    pgNumType = sectPr.find(qn("w:pgNumType"))
    if pgNumType is None:
        pgNumType = OxmlElement("w:pgNumType")
        sectPr.append(pgNumType)
    if roman:
        pgNumType.set(qn("w:fmt"), "lowerRoman")
    else:
        pgNumType.set(qn("w:fmt"), "decimal")
    if restart:
        pgNumType.set(qn("w:start"), "1")


def setup_section(section):
    # ISO A4 (210 × 297 mm) with CHED-style binding margin
    section.page_width = Mm(210)
    section.page_height = Mm(297)
    section.left_margin = Inches(1.5)
    section.right_margin = Inches(1.0)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.header_distance = Inches(0.5)
    section.footer_distance = Inches(0.5)
    section.different_first_page_header_footer = False


def simple_table(doc, headers, rows, col_widths=None):
    table = doc.add_table(rows=1 + len(rows), cols=len(headers))
    table.style = "Table Grid"
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for i, h in enumerate(headers):
        cell = table.rows[0].cells[i]
        cell.text = ""
        p = cell.paragraphs[0]
        set_paragraph_format(p, align="center", line=1.0)
        add_text(p, h, size=10, bold=True)
    for r_i, row in enumerate(rows):
        for c_i, val in enumerate(row):
            cell = table.rows[r_i + 1].cells[c_i]
            cell.text = ""
            p = cell.paragraphs[0]
            set_paragraph_format(p, align="left" if c_i == 0 else "center", line=1.0)
            add_text(p, str(val), size=10)
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)
    cap_space = doc.add_paragraph()
    set_paragraph_format(cap_space, line=1.0, space_after=6)
    return table


def toc_line(doc, left, right, bold=False):
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=2.0)
    tab = p.paragraph_format.tab_stops
    tab.add_tab_stop(Inches(5.7), WD_TAB_ALIGNMENT.RIGHT, WD_TAB_LEADER.DOTS)
    add_text(p, left, bold=bold)
    add_text(p, "\t" + right, bold=bold)
    return p


def build():
    doc = Document()
    section = doc.sections[0]
    setup_section(section)
    add_page_number(section, roman=True, restart=True)

    style = doc.styles["Normal"]
    style.font.name = "Times New Roman"
    style.font.size = Pt(12)
    style._element.rPr.rFonts.set(qn("w:eastAsia"), "Times New Roman")
    style.paragraph_format.line_spacing_rule = WD_LINE_SPACING.DOUBLE

    # ========== TITLE PAGE (no page number feel; still counted as i often omitted)
    blank(doc, 2)
    centered(doc, SCHOOL, bold=True)
    centered(doc, "Sorsogon City", bold=True)
    blank(doc, 2)
    centered(doc, TITLE, bold=True)
    blank(doc, 3)
    centered(doc, "A Thesis")
    centered(doc, "Presented to")
    centered(doc, "the Faculty of the Graduate School")
    centered(doc, SCHOOL.title())
    centered(doc, "Sorsogon City")
    blank(doc, 2)
    centered(doc, "In Partial Fulfillment")
    centered(doc, "of the Requirements for the Degree")
    centered(doc, DEGREE, bold=True)
    blank(doc, 3)
    centered(doc, PROPONENT, bold=True)
    centered(doc, "September 2026")

    # ========== APPROVAL SHEET
    doc.add_page_break()
    centered(doc, SCHOOL, bold=True)
    centered(doc, "Graduate School", bold=True)
    centered(doc, "Sorsogon City")
    blank(doc, 1)
    centered(doc, "APPROVAL SHEET", bold=True, size=14)
    blank(doc, 1)
    body(
        doc,
        f"This thesis entitled “{TITLE},” prepared and submitted by {PROPONENT} in partial fulfillment of the requirements for the degree of {DEGREE}, has been examined and is recommended for acceptance and approval for oral examination.",
        indent=True,
    )
    blank(doc, 2)
    centered(doc, "______________________________", line=1.0)
    centered(doc, "[NAME OF ADVISER], [DEGREE]", line=1.0)
    centered(doc, "Thesis Adviser", line=1.0)
    blank(doc, 1)
    body(
        doc,
        "Approved by the Committee on Oral Examination with a grade of ______________.",
        indent=True,
    )
    blank(doc, 1)
    centered(doc, "______________________________", line=1.0)
    centered(doc, "[NAME], [DEGREE]", line=1.0)
    centered(doc, "Chairperson", line=1.0)
    blank(doc, 1)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=1.0)
    add_text(p, "______________________________                    ______________________________")
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=1.0)
    add_text(p, "[NAME], [DEGREE]                                   [NAME], [DEGREE]")
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=1.0)
    add_text(p, "Member                                                        Member")
    blank(doc, 1)
    body(
        doc,
        "Accepted and approved in partial fulfillment of the requirements for the degree of Master in Business Administration.",
        indent=True,
    )
    blank(doc, 1)
    centered(doc, "______________________________", line=1.0)
    centered(doc, "[NAME OF DEAN], [DEGREE]", line=1.0)
    centered(doc, "Dean, Graduate School", line=1.0)
    centered(doc, "Date: ____________________", line=1.0)

    # ========== DEDICATION
    doc.add_page_break()
    centered(doc, "DEDICATION", bold=True, size=14)
    blank(doc, 3)
    centered(doc, "Para sa mga pasahero ng Sorsogon—", italic=True)
    centered(doc, "sa mga naghihintay sa terminal nang walang katiyakan", italic=True)
    centered(doc, "kung kailan darating ang bus pauwi.", italic=True)
    blank(doc, 1)
    centered(doc, "For my family, who waited with me,", italic=True)
    centered(doc, "and for Sitex and SM Sorsogon,", italic=True)
    centered(doc, "that this work may serve the public for free.", italic=True)
    blank(doc, 2)
    centered(doc, PROPONENT, bold=True)

    # ========== ACKNOWLEDGMENT
    doc.add_page_break()
    centered(doc, "ACKNOWLEDGMENT", bold=True, size=14)
    blank(doc, 1)
    body(
        doc,
        "The researcher offers this work with gratitude to the people and institutions who made the study possible.",
    )
    body(
        doc,
        "To the Graduate School of Saint Louise de Marillac College of Sorsogon, for forming managers who serve Bicol, and to the thesis adviser and panel, whose guidance will refine this manuscript toward oral defense.",
    )
    body(
        doc,
        "To the waiting passengers of the Sorsogon Integrated Terminal Exchange, whose uncertainty about the next bus is the heart of this problem. This system was built so that a mother going home to Matnog, a student returning to Gubat, and a worker bound for Bulan may see, in real time, that a bus is coming.",
    )
    body(
        doc,
        "To the drivers and conductors who carry Sorsogon on the Maharlika Highway and the coastal roads; to the cooperatives and corporations that operate the fleet; and to Sitex, owned with SM Sorsogon, whose public terminal can become a place of information, not only of waiting.",
    )
    body(
        doc,
        "To the local government units of the sixteen (16) municipalities and the city of Sorsogon, and to the emergency responders whose hotlines belong on the public board when a typhoon or ordinance stops travel.",
    )
    body(
        doc,
        "Above all, to God, who watches over every journey home. Ingat po ang lahat.",
    )
    blank(doc, 1)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="right")
    add_text(p, "The Researcher")

    # ========== ABSTRACT
    doc.add_page_break()
    centered(doc, "ABSTRACT", bold=True, size=14)
    blank(doc, 1)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=2.0)
    add_text(p, "PROPONENT: ", bold=True)
    add_text(p, PROPONENT)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=2.0)
    add_text(p, "TITLE: ", bold=True)
    add_text(p, TITLE)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=2.0)
    add_text(p, "DEGREE: ", bold=True)
    add_text(p, DEGREE)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=2.0)
    add_text(p, "SCHOOL: ", bold=True)
    add_text(p, "Saint Louise de Marillac College of Sorsogon, Sorsogon City")
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=2.0)
    add_text(p, "YEAR: ", bold=True)
    add_text(p, YEAR)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0, line=2.0)
    add_text(p, "ADVISER: ", bold=True)
    add_text(p, "[Name of Adviser, Degree]")
    blank(doc, 1)
    body(
        doc,
        "Passengers at the Sorsogon Integrated Terminal Exchange (SITEX) beside SM City Sorsogon wait for provincial buses without reliable knowledge of whether a unit on their route is still coming, how far it is, or when it will arrive. That uncertainty wastes time, raises anxiety, and weakens the service quality of a modern terminal. This descriptive-developmental study designed Sitex Horizon, a real-time bus monitoring and passenger information system for public viewing at SITEX and for use on the mobile phones of drivers, conductors, and waiting passengers.",
        indent=True,
    )
    body(
        doc,
        "The system obtains live location and speed from the built-in Global Positioning System of Android and iOS smartphones—not from a GPS number—and continuously recomputes expected time of arrival as remaining road distance divided by present velocity. It covers all sixteen (16) local government units of Sorsogon with official road kilometers from SITEX, a large editable public announcement board for weather and travel ordinances, a passenger report channel to Sitex and cooperative heads, and an advertisement studio for posters and video. The study is anchored on Maister’s psychology of waiting, SERVQUAL, the Technology Acceptance Model, and stakeholder theory. The developed prototype is proposed as a free public service for Sorsogon, subject to field evaluation with passengers, drivers, cooperatives, and SM/Sitex management after ethics clearance. Under CHED Memorandum Order No. 15, s. 2019, the work is presented as an applied research output suitable as a professional-track capstone or as a thesis, as the Graduate School may require.",
        indent=True,
    )
    p = doc.add_paragraph()
    set_paragraph_format(p, align="left", first_indent=0)
    add_text(p, "Keywords: ", bold=True)
    add_text(
        p,
        "real-time passenger information, bus monitoring, SITEX, Sorsogon, GPS, expected time of arrival, service operations, CHED CMO No. 15, s. 2019",
    )

    # ========== TOC
    doc.add_page_break()
    centered(doc, "TABLE OF CONTENTS", bold=True, size=14)
    blank(doc, 1)
    toc_line(doc, "TITLE PAGE", "i")
    toc_line(doc, "APPROVAL SHEET", "ii")
    toc_line(doc, "DEDICATION", "iii")
    toc_line(doc, "ACKNOWLEDGMENT", "iv")
    toc_line(doc, "ABSTRACT", "v")
    toc_line(doc, "TABLE OF CONTENTS", "vi")
    toc_line(doc, "LIST OF TABLES", "viii")
    toc_line(doc, "LIST OF FIGURES", "ix")
    toc_line(doc, "LIST OF APPENDICES", "x")
    blank(doc, 1)
    toc_line(doc, "Chapter 1  THE PROBLEM AND ITS BACKGROUND", "1", bold=True)
    toc_line(doc, "         Introduction", "1")
    toc_line(doc, "         Background of the Study", "3")
    toc_line(doc, "         Statement of the Problem", "6")
    toc_line(doc, "         Hypothesis", "7")
    toc_line(doc, "         Theoretical Framework", "8")
    toc_line(doc, "         Conceptual Framework", "10")
    toc_line(doc, "         Significance of the Study", "11")
    toc_line(doc, "         Scope and Delimitation", "13")
    toc_line(doc, "         Definition of Terms", "14")
    toc_line(doc, "Chapter 2  REVIEW OF RELATED LITERATURE AND STUDIES", "16", bold=True)
    toc_line(doc, "         Foreign Literature", "16")
    toc_line(doc, "         Local Literature", "19")
    toc_line(doc, "         Foreign Studies", "21")
    toc_line(doc, "         Local Studies", "23")
    toc_line(doc, "         Synthesis", "25")
    toc_line(doc, "Chapter 3  RESEARCH METHODOLOGY", "27", bold=True)
    toc_line(doc, "         Research Design", "27")
    toc_line(doc, "         Research Locale", "28")
    toc_line(doc, "         Respondents of the Study", "29")
    toc_line(doc, "         Sampling Technique", "30")
    toc_line(doc, "         Research Instrument", "30")
    toc_line(doc, "         Data Gathering Procedure", "32")
    toc_line(doc, "         Statistical Treatment of Data", "33")
    toc_line(doc, "         Ethical Considerations", "34")
    toc_line(doc, "Chapter 4  PRESENTATION, ANALYSIS AND INTERPRETATION OF DATA", "36", bold=True)
    toc_line(doc, "Chapter 5  SUMMARY, CONCLUSIONS AND RECOMMENDATIONS", "48", bold=True)
    toc_line(doc, "REFERENCES", "52", bold=True)
    toc_line(doc, "APPENDICES", "57", bold=True)
    toc_line(doc, "CURRICULUM VITAE", "70", bold=True)

    doc.add_page_break()
    centered(doc, "LIST OF TABLES", bold=True, size=14)
    blank(doc, 1)
    toc_line(doc, "1  Official Road Distances of Sorsogon LGUs from SITEX", "5")
    toc_line(doc, "2  Proposed Distribution of Respondents", "29")
    toc_line(doc, "3  Four-Point Likert Scale for System Evaluation", "31")
    toc_line(doc, "4  Verbal Interpretation of Weighted Means", "33")
    toc_line(doc, "5  Mapping of Specific Problems to System Modules", "38")
    toc_line(doc, "6  Sitex Horizon Modules and MBA Operations Functions", "40")
    toc_line(doc, "7  Functional Completeness of the Prototype versus the SOP", "42")
    toc_line(doc, "8  ISO/IEC 25010 Evaluation Matrix (for field survey)", "44")
    toc_line(doc, "9  Proposed Implementation Roles of Stakeholders", "46")

    doc.add_page_break()
    centered(doc, "LIST OF FIGURES", bold=True, size=14)
    blank(doc, 1)
    toc_line(doc, "1  The Sorsogon Integrated Terminal Exchange (SITEX), Balogo", "4")
    toc_line(doc, "2  Conceptual Framework of the Study (IPO Model)", "11")
    toc_line(doc, "3  ETA Physics: Remaining Distance Divided by Live Velocity", "39")
    toc_line(doc, "4  Proposed Data Flow from Driver Phone to Public Board", "41")
    toc_line(doc, "5  Implementation Architecture for Sitex, SM, and Cooperatives", "47")

    doc.add_page_break()
    centered(doc, "LIST OF APPENDICES", bold=True, size=14)
    blank(doc, 1)
    toc_line(doc, "A  Letter to the Dean / Adviser", "58")
    toc_line(doc, "B  Letter to SM Sorsogon / Sitex Management", "59")
    toc_line(doc, "C  Letter to Bus Cooperatives", "60")
    toc_line(doc, "D  Informed Consent Form", "61")
    toc_line(doc, "E  Survey Questionnaire for Passengers", "62")
    toc_line(doc, "F  Survey Questionnaire for Drivers and Conductors", "64")
    toc_line(doc, "G  Evaluation Checklist for Administrators (ISO 25010)", "65")
    toc_line(doc, "H  Interview Guide", "66")
    toc_line(doc, "I  Validation Sheet for Research Instruments", "67")
    toc_line(doc, "J  Sample Public Announcements and Hotlines", "68")
    toc_line(doc, "K  Notes to the Proponent (CHED alignment and remaining field work)", "69")

    # ========== CHAPTER 1
    body_section = doc.add_section(WD_SECTION.NEW_PAGE)
    setup_section(body_section)
    add_page_number(body_section, roman=False, restart=True)

    heading_chapter(doc, "1", "The Problem and Its Background")
    heading_section(doc, "Introduction")
    body(
        doc,
        "Every afternoon at the Sorsogon Integrated Terminal Exchange, people sit with bags at their feet and ask the same question: Kailan po ang next na bus? The printed timetable on the wall, when there is one, does not know if the unit from Matnog is still on the Maharlika Highway, if rain has halved its speed, or if a typhoon ordinance has already stopped travel. The passenger cannot measure the time of arrival. The family waiting at home cannot measure it either. Uncertainty, not merely delay, is the service failure.",
    )
    body(
        doc,
        "Maister (1985) observed that occupied time feels shorter than unoccupied time, and that uncertain waits feel longer than known waits. A passenger who knows that the Gubat bus is 19.16 kilometers away, running at 46 kilometers per hour, and due in about twenty-five minutes can decide to eat, to shop at SM City Sorsogon, or to stay at the bay. A passenger who knows nothing can only worry. Real-time information does not invent buses; it restores dignity to waiting.",
    )
    body(
        doc,
        "Public transportation in the Philippines remains the backbone of provincial mobility. The Department of Transportation’s Public Utility Vehicle Modernization Program seeks safer, more predictable, and more passenger-centered service (DOTr, n.d.). Modern terminals such as the Parañaque Integrated Terminal Exchange demonstrated that infrastructure alone is not enough; passengers still require live information. SITEX, linked by a bridgelink to SM City Sorsogon in Barangay Balogo, is the province’s counterpart—an integrated terminal that opened with the mall in 2022 (The Manila Times, 2022). It serves routes to Bacon, Barcelona, Bulan, Bulusan, Casiguran, Castilla, Donsol, Gubat, Irosin, Juban, Magallanes, Matnog, Pilar, Prieto Diaz, Sorsogon City, and Santa Magdalena.",
    )
    body(
        doc,
        "This study proceeds from a simple managerial conviction. If the driver’s or conductor’s smartphone already contains a Global Positioning System receiver that reports latitude, longitude, speed, and accuracy, then the terminal already has the raw material of a live board. The missing piece is an operations system that brings that signal to the public, recomputes expected time of arrival whenever velocity changes, and lets Sitex management speak to the crowd when weather or government ordinance alters service. The researcher built that system—Sitex Horizon—and offers it free to Sorsogon, subject to the ethics, field evaluation, and institutional acceptance of this graduate work.",
    )

    heading_section(doc, "Background of the Study")
    body(
        doc,
        "Sorsogon is the southernmost province of Luzon. It is the land gateway to the Visayas through the Matnog–Allen roll-on/roll-off connection and a tourism corridor to Donsol, Bulusan, and the Pacific towns. SM City Sorsogon, the eighty-first SM supermall and the fourth in Bicol, opened on 28 October 2022 on a 132,003-square-meter site in Balogo, with a bridgelink to SITEX overlooking the coastal road and the ranges of Juban and Magallanes (The Manila Times, 2022). The terminal therefore sits at the junction of retail, provincial bus operations, and public waiting.",
    )
    if PHOTO.exists():
        p = doc.add_paragraph()
        set_paragraph_format(p, align="center", line=1.0)
        run = p.add_run()
        run.add_picture(str(PHOTO), width=Inches(5.5))
        caption(doc, "Figure 1. The Sorsogon Integrated Terminal Exchange (SITEX), Barangay Balogo, Sorsogon City.")

    body(
        doc,
        "At present, waiting passengers depend on hearsay, the memory of conductors, and occasional handwritten notices. When a typhoon threatens, the absence of a huge, immediately editable public announcement is itself a safety gap. Republic Act No. 10121 institutionalizes disaster risk reduction and the duty to inform communities (Official Gazette, 2010). A terminal that cannot say, in large letters, that travel is suspended, that only two to five buses remain, and that people should call the hotlines, fails a basic operations and public-safety test.",
    )
    body(
        doc,
        "The researcher, as a passenger among other passengers, experienced this gap and asked whether Sitex and SM Sorsogon might host a monitoring system for the benefit of riders and operators. The resulting prototype uses the phone GPS already in the hands of drivers and conductors. It is not a GPS number. It is the W3C Geolocation Application Programming Interface on Android and iOS, which yields coordinates, speed in meters per second, heading, and accuracy in meters, with enableHighAccuracy set so that the chip uses satellite, Wi-Fi, and cell assistance. Expected arrival is not a printed guess. It is remaining official road kilometers divided by present speed in kilometers per hour, multiplied by sixty to yield minutes, and it updates whenever that speed changes.",
    )
    body(
        doc,
        "Table 1 presents the sixteen local government units covered by the prototype, with Philippine ZIP Codes and official road distances from the Sorsogon capital corridor as compiled from DENR and local planning references used in the system. Accuracy of kilometers matters because ETA is only as honest as the remaining distance.",
    )
    caption(doc, "Table 1. Official Road Distances of Sorsogon LGUs from SITEX")
    simple_table(
        doc,
        ["Local Government Unit", "ZIP", "Road km from SITEX", "Usual via"],
        [
            ["Sorsogon City (proper)", "4700", "3.20", "City proper"],
            ["Bacon District", "4701", "10.70", "Bacon Road"],
            ["Casiguran", "4702", "19.03", "Maharlika Highway"],
            ["Juban", "4703", "23.05", "Maharlika Highway"],
            ["Bulusan", "4704", "42.52", "Gubat–Barcelona"],
            ["Magallanes", "4705", "48.13", "Juban"],
            ["Bulan", "4706", "63.09", "Irosin"],
            ["Irosin", "4707", "43.35", "Maharlika Highway"],
            ["Matnog", "4708", "66.64", "Irosin"],
            ["Santa Magdalena", "4709", "71.97", "Bulusan coastal"],
            ["Gubat", "4710", "19.16", "Coastal Road"],
            ["Prieto Diaz", "4711", "34.40", "Bacon–Pacific"],
            ["Barcelona", "4712", "27.13", "Gubat coastal"],
            ["Castilla", "4713", "25.11", "West coastal"],
            ["Pilar", "4714", "55.69", "Castilla"],
            ["Donsol", "4715", "66.47", "Pilar–Castilla"],
        ],
        col_widths=[2.2, 0.8, 1.6, 1.6],
    )
    body(
        doc,
        "The managerial problem is therefore not the absence of vehicles or of a terminal building. It is the absence of an operations information system that treats waiting as a service process, GPS as a live input, and the public board as a duty of care. Sitex Horizon was developed to close that gap.",
    )

    heading_section(doc, "Statement of the Problem")
    body(
        doc,
        "The study aimed to develop Sitex Horizon, a real-time bus monitoring and passenger information system for the Sorsogon Integrated Terminal Exchange. Specifically, it sought to answer the following questions:",
    )
    body(
        doc,
        "1. What is the present passenger waiting experience at SITEX in terms of:",
        indent=True,
    )
    bullet(doc, "1.1 availability of arrival and route information;")
    bullet(doc, "1.2 perceived waiting time and uncertainty;")
    bullet(doc, "1.3 access to weather, ordinance, and emergency announcements; and")
    bullet(doc, "1.4 a channel for passenger reports to Sitex and the cooperatives?")
    body(
        doc,
        "2. What real-time monitoring system can be developed for SITEX covering the sixteen (16) local government units of Sorsogon, with the following modules:",
        indent=True,
    )
    bullet(doc, "2.1 live GPS tracking and continuously updated expected time of arrival;")
    bullet(doc, "2.2 a large, editable public announcement board;")
    bullet(doc, "2.3 a passenger report facility transmitted to Sitex and cooperative heads;")
    bullet(doc, "2.4 driver and conductor mobile sharing of built-in GPS; and")
    bullet(doc, "2.5 an advertisement space that accepts poster and video creatives?")
    body(
        doc,
        "3. What is the functional quality of the developed prototype in terms of the ISO/IEC 25010 product quality characteristics of functional suitability, performance efficiency, usability, reliability, security, and maintainability?",
        indent=True,
    )
    body(
        doc,
        "4. What implementation model may be proposed for SM Sorsogon, Sitex administration, bus cooperatives, and the local government, including staffing, data ethics, and free public use for Sorsogon?",
        indent=True,
    )

    heading_section(doc, "Hypothesis")
    body(
        doc,
        "Because the study is primarily descriptive-developmental, hypotheses apply to the field evaluation stage after the prototype is shown to respondents. The following null hypotheses will be tested at the .05 level of significance once survey data are gathered:",
    )
    body(
        doc,
        "Ho1. There is no significant difference in perceived waiting uncertainty of passengers before and after exposure to Sitex Horizon.",
        indent=True,
    )
    body(
        doc,
        "Ho2. There is no significant difference in the evaluation of the prototype among passengers, drivers/conductors, and administrators.",
        indent=True,
    )
    body(
        doc,
        "Ho3. The weighted means of ISO/IEC 25010 characteristics are not significantly different from the “Agree / Functionally Acceptable” threshold of 2.50 on a four-point scale.",
        indent=True,
    )
    body(
        doc,
        "Until the field survey is completed under ethics clearance, these hypotheses remain untested. Chapter 4 therefore presents the developed system as the primary output and provides the evaluation matrices to be filled after data gathering. This is consistent with developmental research, in which the product is itself a finding (Richey & Klein, 2007).",
    )

    heading_section(doc, "Theoretical Framework")
    body(
        doc,
        "The study rests on four complementary theories from service operations, information systems, and strategic management.",
    )
    heading_sub(doc, "Psychology of Waiting Lines")
    body(
        doc,
        "Maister (1985) argued that the psychology of waiting is as important as the mathematics of queues. Uncertain waits feel longer than finite waits; unexplained waits feel longer than explained waits; and anxiety makes waits feel longer. A live ETA and a public explanation of typhoon suspension occupy the wait with knowledge. Little’s Law, L = λW, reminds managers that waiting time (W) and the number of people waiting (L) move together when arrival rate (λ) is given (Little, 1961). Information does not reduce λ, but it can reduce perceived W and the abandoned-wait behavior that Falcon et al. (2025) observed among land-transport clients in Eastern Visayas.",
    )
    heading_sub(doc, "SERVQUAL and Service Operations")
    body(
        doc,
        "Parasuraman, Zeithaml, and Berry (1988) measured service quality as the gap between expectation and perception along reliability, assurance, tangibles, empathy, and responsiveness. A modern terminal building is a tangible. Live GPS arrival is reliability. A huge announcement during a typhoon is responsiveness and assurance. A report button that actually reaches the cooperative is empathy. Sitex Horizon is therefore not a gadget. It is a service-quality intervention at the operations core of the terminal.",
    )
    heading_sub(doc, "Technology Acceptance")
    body(
        doc,
        "Davis (1989) showed that perceived usefulness and perceived ease of use predict intention to use an information system. Venkatesh, Morris, Davis, and Davis (2003) extended this in the Unified Theory of Acceptance and Use of Technology (UTAUT) with performance expectancy, effort expectancy, social influence, and facilitating conditions. Drivers will share GPS only if the app is easy and clearly useful to their cooperative; passengers will trust the board only if ETAs match lived arrival. The prototype was therefore designed with large type for public screens, a four-digit staff PIN, and a driver screen that can run on the phone already in the cab.",
    )
    heading_sub(doc, "Stakeholder Theory")
    body(
        doc,
        "Freeman (1984) defined stakeholders as any group that can affect or is affected by the achievement of the organization’s objectives. SITEX is not a single firm. It is a node among SM Prime’s mall operations, Sitex terminal management, bus cooperatives and corporations, drivers and conductors, passengers, the City of Sorsogon, municipal LGUs, LTFRB, and disaster agencies. An MBA intervention that ignores any of these will fail at implementation. The system therefore routes passenger reports first to Sitex/SM and then onward to cooperative heads, and it treats advertisement space as a legitimate commercial layer that can sustain the public board without charging passengers.",
    )
    heading_sub(doc, "Physical Model of Arrival")
    body(
        doc,
        "The computational heart of the system is a kinematics identity, not a timetable:",
    )
    centered(doc, "ETA (minutes) = (remaining kilometers ÷ speed in km/h) × 60", italic=True, line=1.5)
    body(
        doc,
        "When speed falls from 60 km/h to 30 km/h, remaining time doubles at once. When the bus is stopped, ETA is undefined and the board must not invent a number. Remaining kilometers are taken from official road distances along the route polyline, not from straight-line GPS distance, so that a bus in Irosin is credited with the Maharlika path rather than a flight over the hills. This is the accuracy the researcher promised the public.",
    )

    heading_section(doc, "Conceptual Framework")
    body(
        doc,
        "The study adopts the Input–Process–Output (IPO) model widely used in Philippine graduate developmental studies (Calderon & Gonzales, 1993).",
    )
    body(
        doc,
        "Inputs. Passenger waiting needs; official road kilometers and ZIP Codes of sixteen LGUs; live GPS fixes (latitude, longitude, speed, accuracy) from driver and conductor phones; weather and LGU ordinances; passenger reports; partner advertisements; staff PIN and administrative roles.",
        indent=True,
    )
    body(
        doc,
        "Process. Sitex Horizon: (a) ingest GPS and snap to the official route; (b) recompute ETA every telemetry tick; (c) publish the public terminal board, map, and municipality grid; (d) push announcements and hotlines; (e) receive and forward reports; (f) rotate poster or video ads; (g) lock staff functions behind the operations PIN.",
        indent=True,
    )
    body(
        doc,
        "Outputs. Informed waiting; continuously updated arrivals; safer public communication in bad weather; documented passenger experience for cooperatives; a proposed free implementation for Sitex and SM Sorsogon.",
        indent=True,
    )
    body(
        doc,
        "Feedback. Field evaluation using ISO/IEC 25010 and SERVQUAL-informed items, then revision of the prototype and of the implementation model.",
        indent=True,
    )
    caption(doc, "Figure 2. Conceptual Framework of the Study (Input–Process–Output with Feedback)")
    # Simple text figure
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.5)
    add_text(p, "INPUT  →  SITEX HORIZON PROCESS  →  OUTPUT", bold=True, size=11)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.0)
    add_text(p, "Passenger needs · GPS · road km · weather · reports · ads", size=10, italic=True)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.0)
    add_text(p, "Live ETA · announcement · map · report desk · ad studio", size=10, italic=True)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.0)
    add_text(p, "Reduced uncertainty · public information · proposed free service", size=10, italic=True)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.0, space_after=12)
    add_text(p, "↑________________ feedback from field evaluation ________________↑", size=10)

    heading_section(doc, "Significance of the Study")
    body(
        doc,
        "The study is significant to the following:",
    )
    body(
        doc,
        "Passengers. They gain the power to measure waiting and to plan the remainder of the day, including whether to wait, to eat, or to seek another ride home.",
        indent=True,
    )
    body(
        doc,
        "Drivers and conductors. Their ordinary smartphones become the fleet’s telemetry. They are not asked to buy a separate GPS unit. Sharing location is an operations task, not a capital expense.",
        indent=True,
    )
    body(
        doc,
        "Sitex and SM Sorsogon. The terminal can demonstrate service quality worthy of a modern exchange beside a supermall, with a public board, crisis announcements, and a partner advertisement slot.",
        indent=True,
    )
    body(
        doc,
        "Bus cooperatives and corporations. Reports of lateness, overcharging, safety, and unit condition reach them through Sitex rather than dying as hallway complaints. Live speed and ETA also help dispatch.",
        indent=True,
    )
    body(
        doc,
        "Local government and disaster agencies. Typhoon and ordinance messages can occupy the largest type on the public screen, with hotlines, in fulfillment of the spirit of RA 10121.",
        indent=True,
    )
    body(
        doc,
        "The Graduate School and MBA practice. The work is an applied operations-management and service-quality project aligned with CHED CMO No. 15, s. 2019 for professional graduate programs, and with the Vincentian mission of Saint Louise de Marillac College of Sorsogon to serve the poor and the traveling public of the province.",
        indent=True,
    )
    body(
        doc,
        "Future researchers. The instruments, the kilometer table, and the ETA model may be replicated in other Bicol terminals and in municipal ports.",
        indent=True,
    )

    heading_section(doc, "Scope and Delimitation")
    body(
        doc,
        "The study covers the design and developmental prototype of Sitex Horizon for routes between SITEX and the sixteen LGUs of Sorsogon Province. It includes public terminal display, passenger mobile view, driver/conductor GPS sharing, administrative announcements, passenger reports, and advertisements.",
    )
    body(
        doc,
        "It does not claim to have already instrumented every bus in the province. Live GPS from a phone is demonstrated; fleet-wide adoption is an implementation recommendation. It does not replace LTFRB franchising, fare setting, or traffic law. It does not track passengers’ personal phones. Advertisement content is the responsibility of Sitex management. Road kilometers are official planning distances and may differ slightly from a particular driver’s habitual turn; the system snaps GPS to the defined polyline.",
    )
    body(
        doc,
        "Field survey results (weighted means, tests of difference) are scheduled after ethics clearance and are not fabricated in this manuscript. Chapter 4 presents the developed product, the mapping to the statement of the problem, and empty evaluation tables to be completed when data are in. The researcher states this limitation plainly, in keeping with academic honesty required of graduate work under CHED.",
    )
    body(
        doc,
        "The study is delimited to SITEX in Barangay Balogo, Sorsogon City, and to the provincial bus and modern jeepney services that use that terminal. Inter-regional luxury buses that merely pass Sorsogon may be added later but are not in the present route set.",
    )

    heading_section(doc, "Definition of Terms")
    body(
        doc,
        "The following terms are defined operationally as used in this study.",
    )
    terms = [
        (
            "Advertisement studio",
            "The administrative module in which Sitex staff upload a poster (image) or a video, set sponsor name, headline, caption, and dwell time, and publish the creative to the public board.",
        ),
        (
            "Expected time of arrival (ETA)",
            "The number of minutes obtained by dividing remaining official road kilometers by the bus’s present speed in kilometers per hour, then multiplying by sixty. It is blank when speed is effectively zero.",
        ),
        (
            "Geolocation API",
            "The standard browser and mobile interface that returns the phone’s latitude, longitude, speed, heading, and accuracy from the built-in GPS and related sensors (W3C, n.d.).",
        ),
        (
            "Passenger report",
            "A ticketed complaint or experience (late arrival, behavior, bus condition, overcharging, safety, others) filed by a rider and forwarded by Sitex to the cooperative or corporation concerned.",
        ),
        (
            "Public announcement",
            "A large, immediately editable message on the terminal board, classified as information, caution, or critical, optionally showing emergency hotlines.",
        ),
        (
            "Sitex Horizon",
            "The prototype real-time monitoring and passenger information system developed in this study for the Sorsogon Integrated Terminal Exchange.",
        ),
        (
            "SITEX",
            "Sorsogon Integrated Terminal Exchange, the provincial terminal beside SM City Sorsogon in Barangay Balogo, Sorsogon City.",
        ),
        (
            "Staff PIN",
            "A four-digit operations code that unlocks the administrative console. The prototype default is 4700, the ZIP Code of Sorsogon City, and must be changed by Sitex management upon adoption.",
        ),
    ]
    for term, definition in terms:
        p = doc.add_paragraph()
        set_paragraph_format(p, align="justify", first_indent=0.5)
        add_text(p, f"{term}. ", bold=True, italic=True)
        add_text(p, definition)

    # ========== CHAPTER 2
    doc.add_page_break()
    heading_chapter(doc, "2", "Review of Related Literature and Studies")
    body(
        doc,
        "This chapter presents foreign and local literature and studies that shaped the design of Sitex Horizon. The review moves from waiting and service quality, to real-time passenger information, to Philippine terminal and transport policy, and ends in a synthesis that locates the research gap.",
    )

    heading_section(doc, "Foreign Literature")
    body(
        doc,
        "Waiting is a managed service, not a residue of operations. Maister (1985) distilled eight propositions, among them that occupied waits feel shorter, that uncertain waits feel longer, and that unexplained waits feel longer. Subsequent service-operations writing treated information as a design variable: if the firm cannot shorten the queue, it can still shorten the experience of the queue. Parasuraman et al. (1988) gave managers a language—reliability, responsiveness, assurance, empathy, tangibles—with which to audit that experience. A glass terminal with no arrival data is strong on tangibles and weak on reliability.",
    )
    body(
        doc,
        "In public transport, real-time information has a measured effect. Watkins, Ferris, Borning, Rutherford, and Layton (2011), in the OneBusAway studies, found that mobile real-time information reduced perceived wait time even when actual wait did not change as much. Brakewood, Macfarlane, and Watkins (2015) reported ridership gains in New York City after real-time bus information. Tang and Thakuriah (2012) likewise associated real-time bus information with ridership effects in Chicago. The managerial implication is that information is not a cosmetic display. It is part of the product.",
    )
    body(
        doc,
        "The technology-acceptance literature cautions that a system unused is a system that does not exist. Davis (1989) isolated perceived usefulness and perceived ease of use. Venkatesh et al. (2003) added social influence and facilitating conditions. For a provincial terminal, facilitating conditions include a working internet link, a phone that drivers already own, and a staff PIN that clerks can remember. ISO/IEC 25010 (2011) supplies the product-quality vocabulary—functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability, portability—against which an MBA prototype can be judged without pretending to be a computer-science dissertation.",
    )
    body(
        doc,
        "Stakeholder theory (Freeman, 1984) prevents the researcher from treating “the terminal” as one boss. A mall owner, a terminal concession, several cooperatives, regulators, and the riding public do not share a single maximand. An advertisement slot that is honest—labeled Advertisement, not disguised as an arrival—creates a revenue language SM can understand without corrupting the public-information duty. That is an MBA design choice, not an information-technology accident.",
    )
    body(
        doc,
        "On the physics of tracking, civil-engineering and operations research have long separated scheduled headway from real headway. GPS speed over ground, as exposed by consumer devices, is an observed velocity, not a timetable assumption. When that velocity is combined with a known remaining path length, ETA becomes a live ratio. The World Wide Web Consortium’s Geolocation API specifies that a position may include speed and heading (W3C, n.d.). That specification is what makes a driver’s Android or iPhone a legitimate telemetry source without a separate hardware tracker.",
    )

    heading_section(doc, "Local Literature")
    body(
        doc,
        "Philippine public transport is being asked to modernize while remaining the ordinary person’s ride. The Public Utility Vehicle Modernization Program of the Department of Transportation aims at safer, more dignified, and more organized service (DOTr, n.d.). Integrated terminals are part of that vision. The Parañaque Integrated Terminal Exchange showed both the promise and the friction of a large transfer hub. SITEX is smaller, provincial, and tied to a retail mall—an institutional hybrid that an MBA thesis is well placed to study.",
    )
    body(
        doc,
        "SM City Sorsogon opened on 28 October 2022 as SM Prime’s eighty-first supermall and the fourth in Bicol, on 132,003 square meters in Balogo, with a bridgelink to SITEX and views toward Bulusan and the Juban–Magallanes ranges (The Manila Times, 2022). The terminal is therefore already a designed public space. What it still lacks, on the evidence of passenger practice, is designed public information.",
    )
    body(
        doc,
        "Waiting under poor information is documented in Metro Manila. Mijares, Suzuki, and colleagues, in work on MRT-3, recorded long platform and access waits and noted that passengers were not given real-time information about expected waiting (Mijares et al., 2016). If that is true in a rail system with a fixed guideway, it is more true for provincial buses whose speeds vary with rain, fiesta traffic, and the Padang or Irosin grades.",
    )
    body(
        doc,
        "Disaster communication is not optional. Republic Act No. 10121, the Philippine Disaster Risk Reduction and Management Act of 2010, situates warning and public information inside the state’s duty of care (Official Gazette, 2010). When an LGU ordinance or a typhoon signal stops travel, the terminal is one of the few places where people who are already in motion can still be told, in time, to stay, to call a hotline, or to go home another day. A huge editable announcement is therefore a compliance-relevant operations tool, not a decoration.",
    )
    body(
        doc,
        "CHED Memorandum Order No. 15, series of 2019, reclassified graduate programs into academic and professional tracks. A Master in Business Administration is typically a professional master’s degree whose culminating output may be a capstone or practice-based project rather than a purely theoretical thesis (CHED, 2019). This manuscript follows the five-chapter form still required by many Graduate Schools, including Catholic colleges in Bicol, while remaining an applied operations project. Publication in a refereed venue, if the academic track or the School so requires, can be drawn from Chapters 1, 4, and 5.",
    )
    body(
        doc,
        "Local business research in Sorsogon has examined liquidity of small firms, school-based management, and leadership (Bongalonta & Bongalonta, 2022; Maraño & Chua, 2025). Direct MBA work on terminal information systems in the province remains scarce. That scarcity is the local gap this study enters.",
    )

    heading_section(doc, "Foreign Studies")
    body(
        doc,
        "Watkins et al. (2011) studied OneBusAway users in Seattle and found that real-time information reduced the perceived wait and increased walking to a stop when a bus was known to be near. The present study borrows the insight, not the software: Sorsogon passengers similarly decide whether to remain at SITEX or to cross into SM.",
    )
    body(
        doc,
        "Brakewood et al. (2015) used a natural experiment in New York City and estimated ridership effects of real-time bus information. The MBA lesson is that information can move demand. A provincial terminal that publishes honest ETAs may not create buses, but it can keep passengers from defecting to informal rides when a unit is, in fact, twelve minutes away.",
    )
    body(
        doc,
        "Design and development research, as articulated by Richey and Klein (2007), treats the making of an intervention as a legitimate mode of inquiry: analysis, design, development, and evaluation in context. ISO/IEC 25010 (2011) then offers the evaluation language. The present prototype is developed first; user evaluation is the next empirical gate.",
    )

    heading_section(doc, "Local Studies")
    body(
        doc,
        "A recent Philippine design study, JeePS, proposed a real-time public-transportation tracking system with a web application for passengers and a mobile application for drivers, including GPS tracking, rough time estimation, and a report facility (Springer conference paper, 2024). Live testing suggested improved passenger satisfaction toward jeepneys. Sitex Horizon is kin to that work but is situated in a named provincial terminal, uses official road kilometers for all sixteen Sorsogon LGUs, treats typhoon announcements as a first-class module, and is framed as an MBA service-operations intervention offered free to Sitex and SM.",
    )
    body(
        doc,
        "Falcon, Dugaria, and Remojo (2025) built a three-tier queue management system for land-transportation clients in Eastern Visayas and explicitly invoked Maister (1985) and Little’s Law. Their finding that clients leave when status cannot be tracked is the same human behavior SITEX passengers describe in ordinary language: umalis na lang ako, wala namang update.",
    )
    body(
        doc,
        "Corpuz (2025) demonstrated a handheld GPS-based passenger information display for LRT and MRT, computing station identity from coordinates stored on the device. The principle—GPS plus a known map of stops—is the same principle Sitex Horizon applies to municipal destinations rather than rail stations.",
    )
    body(
        doc,
        "These local studies confirm that Filipino passengers respond to information, that GPS on consumer devices is an acceptable sensor, and that terminals and agencies still run on static processes. None of them is a system for SITEX covering Bacon through Donsol with live ETA, a crisis announcement board, cooperative-bound reports, and an advertisement studio under SM Sorsogon’s roof. That is the gap.",
    )

    heading_section(doc, "Synthesis")
    body(
        doc,
        "From foreign literature, the study takes the psychology of waiting, SERVQUAL, technology acceptance, stakeholder theory, and the empirical result that real-time information changes perceived wait and sometimes ridership. From local literature, it takes PUV modernization, the institutional fact of SITEX beside SM Sorsogon, MRT evidence that Philippine passengers wait without information, and RA 10121’s demand for public warning. From studies, it takes GPS-plus-map as a workable architecture and the absence of a Sorsogon-terminal implementation.",
    )
    body(
        doc,
        "The research gap may be stated as follows: there is no documented, MBA-framed, publicly offered real-time bus monitoring and passenger information system for the Sorsogon Integrated Terminal Exchange that (a) uses driver-phone GPS speed to recompute ETA on official municipal road kilometers, (b) publishes huge editable announcements for weather and ordinances, (c) forwards passenger reports to cooperatives through Sitex, and (d) includes a managed advertisement space. Sitex Horizon is designed to occupy that gap.",
    )

    # ========== CHAPTER 3
    doc.add_page_break()
    heading_chapter(doc, "3", "Research Methodology")
    heading_section(doc, "Research Design")
    body(
        doc,
        "The study employed descriptive-developmental research. Descriptive research portrays the present waiting experience at SITEX. Developmental research, following Richey and Klein (2007) and the tradition of Calderon and Gonzales (1993) in Philippine thesis writing, produces an intervention—here, Sitex Horizon—and evaluates it against stated objectives. The design is appropriate to an MBA professional output under CHED CMO No. 15, s. 2019 because it solves an operations problem rather than testing a purely theoretical model.",
    )
    body(
        doc,
        "The developmental cycle had four phases: (1) problem definition and stakeholder mapping; (2) design of modules (live map, ETA engine, announcement, reports, driver GPS, advertisement studio); (3) construction of a working internet-connected prototype covering sixteen LGUs; and (4) planned field evaluation using researcher-made instruments aligned with SERVQUAL and ISO/IEC 25010. Phase 4 is specified in this chapter and in the appendices; its numerical results will enter Chapter 4 after data gathering.",
    )

    heading_section(doc, "Research Locale")
    body(
        doc,
        "The locale is the Sorsogon Integrated Terminal Exchange in Barangay Balogo, East District, Sorsogon City, Province of Sorsogon, immediately beside SM City Sorsogon along the coastal road and the Pan-Philippine Highway corridor. The coverage of monitoring is the entire province: Sorsogon City (4700), Bacon (4701), Casiguran (4702), Juban (4703), Bulusan (4704), Magallanes (4705), Bulan (4706), Irosin (4707), Matnog (4708), Santa Magdalena (4709), Gubat (4710), Prieto Diaz (4711), Barcelona (4712), Castilla (4713), Pilar (4714), and Donsol (4715).",
    )

    heading_section(doc, "Respondents of the Study")
    body(
        doc,
        "Four groups of respondents are intended for the field evaluation.",
    )
    caption(doc, "Table 2. Proposed Distribution of Respondents")
    simple_table(
        doc,
        ["Group", "n (proposed)", "Rationale"],
        [
            ["Waiting passengers at SITEX", "120", "Primary beneficiaries; SERVQUAL items"],
            ["Drivers and conductors", "30", "GPS users; effort expectancy"],
            ["Sitex / SM Sorsogon staff", "10", "Announcement, ads, report desk"],
            ["Cooperative / corporation heads", "10", "Report recipients; dispatch"],
            ["Total", "170", ""],
        ],
        col_widths=[2.4, 1.3, 2.5],
    )
    body(
        doc,
        "The proposed sizes may be adjusted with the adviser to match the actual volume of trips on survey days and the number of cooperatives willing to participate. They are large enough for descriptive weighted means and for a Kruskal–Wallis or ANOVA comparison among groups if assumptions are met.",
    )

    heading_section(doc, "Sampling Technique")
    body(
        doc,
        "Purposive sampling will be used for staff and cooperative heads, because those roles are few and information-rich. For passengers and drivers, convenience sampling at the terminal during peak homeward hours (late morning and late afternoon) will be combined with a quota by destination so that east-coast, west-coast, and south-highway routes are represented. Only persons eighteen (18) years of age and older who give informed consent will be included.",
    )

    heading_section(doc, "Research Instrument")
    body(
        doc,
        "Four researcher-made instruments appear in the appendices: (a) passenger questionnaire on present waiting experience and on the prototype; (b) driver/conductor questionnaire on GPS sharing and usefulness; (c) administrator ISO/IEC 25010 checklist; and (d) a semi-structured interview guide. Items on waiting use Maister’s propositions. Items on quality use a four-point Likert scale to avoid a neutral midpoint that conceals decision, a practice common in Philippine graduate evaluation studies.",
    )
    caption(doc, "Table 3. Four-Point Likert Scale for System Evaluation")
    simple_table(
        doc,
        ["Weight", "Response", "Mean range", "Verbal interpretation"],
        [
            ["4", "Strongly agree", "3.50 – 4.00", "Very high / Highly acceptable"],
            ["3", "Agree", "2.50 – 3.49", "High / Acceptable"],
            ["2", "Disagree", "1.50 – 2.49", "Low / Needs improvement"],
            ["1", "Strongly disagree", "1.00 – 1.49", "Very low / Not acceptable"],
        ],
        col_widths=[1.0, 1.6, 1.6, 2.0],
    )
    body(
        doc,
        "Content validity will be established by at least three experts: one MBA or operations faculty, one information-systems or IT faculty, and one transport or terminal practitioner. A validation sheet is provided in Appendix I. Reliability will be estimated by Cronbach’s alpha on a pilot of thirty passengers; an alpha of .70 or higher will be considered acceptable (Nunnally, 1978).",
    )

    heading_section(doc, "Data Gathering Procedure")
    body(
        doc,
        "The following sequence will be observed:",
    )
    bullet(doc, "1. Secure a letter of endorsement from the Dean of the Graduate School.")
    bullet(doc, "2. Seek permission from SM Sorsogon / Sitex management to conduct the survey on the premises and to demonstrate the public board.")
    bullet(doc, "3. Seek cooperation from bus cooperatives for driver participation.")
    bullet(doc, "4. Obtain ethics clearance or the School’s equivalent research-ethics review.")
    bullet(doc, "5. Pilot the instruments and revise.")
    bullet(doc, "6. Demonstrate the prototype on a terminal screen or a large monitor, then administer questionnaires.")
    bullet(doc, "7. Conduct short interviews with staff and cooperative heads.")
    bullet(doc, "8. Encode, analyze, and return a results brief to Sitex as courtesy.")
    body(
        doc,
        "No GPS data from passengers’ personal phones will be collected. Driver GPS is used only while the driver is on a trip and has started sharing.",
    )

    heading_section(doc, "Statistical Treatment of Data")
    body(
        doc,
        "Descriptive statistics will include frequency, percentage, and weighted mean. Perceived waiting uncertainty before and after exposure to the prototype will be compared using a paired t-test or the Wilcoxon signed-rank test, depending on normality (Shapiro–Wilk). Differences among passenger, driver, and administrator evaluations will be tested by one-way ANOVA or Kruskal–Wallis. The .05 level of significance will be used. Weighted means will be interpreted as in Table 4.",
    )
    caption(doc, "Table 4. Verbal Interpretation of Weighted Means")
    simple_table(
        doc,
        ["Weighted mean", "Interpretation (experience items)", "Interpretation (system items)"],
        [
            ["3.50 – 4.00", "Very high uncertainty / very poor info", "Highly acceptable"],
            ["2.50 – 3.49", "High uncertainty / poor info", "Acceptable"],
            ["1.50 – 2.49", "Low uncertainty / adequate info", "Needs improvement"],
            ["1.00 – 1.49", "Very low uncertainty / good info", "Not acceptable"],
        ],
        col_widths=[1.5, 2.4, 2.2],
    )
    body(
        doc,
        "For SOP 2, analysis is qualitative-developmental: a feature-to-problem matrix showing that each specified module exists and operates. For SOP 4, analysis is a proposed implementation model, not a statistical test.",
    )

    heading_section(doc, "Ethical Considerations")
    body(
        doc,
        "The study observes informed consent, the right to refuse, and the right to withdraw. Questionnaires are anonymous unless the respondent chooses to be named in a report ticket. Driver location is operational data, not a public dossier of a person; the public board shows plate, route, speed, and ETA, which are already visible to anyone watching a bus. The staff PIN must be changed from the prototype default before any production use. Advertisement content must not be indecent or misleading. The researcher offers the system free to Sorsogon and will not sell passenger data. Republic Act No. 10173, the Data Privacy Act of 2012, will guide any later cloud deployment (Official Gazette, 2012). Minors will not be surveyed.",
    )

    # ========== CHAPTER 4
    doc.add_page_break()
    heading_chapter(doc, "4", "Presentation, Analysis and Interpretation of Data")
    body(
        doc,
        "This chapter presents the developed Sitex Horizon system as the principal finding of the developmental phase, maps each module to the statement of the problem, and lays out the evaluation tables to be completed after field survey. No survey weighted means are invented. Where a table awaits data, it is labeled as such.",
    )

    heading_section(doc, "The Present Waiting Problem as Designed Against")
    body(
        doc,
        "SOP 1 asked what waiting is like at SITEX in terms of information, uncertainty, announcements, and reports. Pending the passenger survey, the researcher’s problem definition—drawn from lived waiting and from the literature in Chapter 2—is that arrival information is not live, uncertainty is high, crisis announcements are not huge and instantly editable, and complaints do not have a ticketed path to cooperatives. The prototype was built as a direct answer to that definition. The passenger questionnaire in Appendix E will quantify SOP 1. Until then, SOP 1 is treated as the design brief, not as a fabricated baseline table.",
    )

    heading_section(doc, "The Developed System: Sitex Horizon")
    body(
        doc,
        "SOP 2 asked what system can be developed. The output is Sitex Horizon, an internet-connected prototype with six public or staff surfaces: (1) the terminal live board, (2) the passenger phone view, (3) the driver/conductor phone, (4) the report form, (5) Sitex Control (announcements, weather, reports, PIN, advertisements), and (6) the cinema advertisement slot on the public board.",
    )
    caption(doc, "Table 5. Mapping of Specific Problems to System Modules")
    simple_table(
        doc,
        ["Specific problem", "Module in Sitex Horizon", "What the public sees"],
        [
            ["No live arrival information", "Live GPS map + arrival board", "Plate, LGU, km left, speed, ETA"],
            ["Cannot measure waiting", "ETA = km ÷ speed × 60", "Minutes that move when speed moves"],
            ["No huge travel announcements", "Announcement banner (info / caution / critical)", "Typhoon, limited buses, hotlines"],
            ["No report path", "Passenger report + admin forward", "Ticket SX-YYYY-#### to cooperative"],
            ["Driver has only a phone", "Geolocation API share", "Accuracy in meters, speed from GPS"],
            ["Terminal has unused screen time", "Advertisement studio", "Labeled poster or HD video"],
        ],
        col_widths=[2.1, 2.1, 2.0],
    )
    body(
        doc,
        "The live board shows an HD view of the actual SITEX building, a connection status (live cloud when the internet is present), a province coverage grid of sixteen LGUs with ZIP Codes and road kilometers, and next arrivals. When a driver shares GPS, the bus icon moves on the geographic map and remaining kilometers decay with speed. When rain is set as the weather overlay, simulated speeds fall; when typhoon is set, trips suspend and a critical announcement is published automatically, which the staff may still edit.",
    )

    heading_sub(doc, "How accuracy is obtained from the driver’s phone")
    body(
        doc,
        "The question often asked of this project is whether the system uses a “GPS number.” It does not. Android and iOS phones expose location through the Geolocation API. With high accuracy enabled, the device returns latitude, longitude, speed (meters per second, converted to km/h), heading, and accuracy in meters. Sitex Horizon applies that fix to the official route polyline of the trip. Remaining road kilometers, not crow-fly kilometers, enter the ETA formula. If velocity changes, ETA changes on the next tick. If the phone is offline, the public board reports the loss of live cloud rather than a frozen lie.",
    )
    caption(doc, "Figure 3. ETA physics used by Sitex Horizon")
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.5)
    add_text(p, "remainingKm  ÷  speedKmh  ×  60  =  ETA minutes", bold=True)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.0, space_after=12)
    add_text(p, "If speed = 0, the board shows an em dash, not a false clock.", size=10, italic=True)

    heading_sub(doc, "Public announcement and passenger report")
    body(
        doc,
        "The announcement module is designed for the words the public actually needs: that only two to five buses are running because of weather; that there is no travel today because of an ordinance and a typhoon; that people should take care and call the hotlines in an emergency. Staff load a template (No travel, Limited buses, Service resumed), edit the title and body, choose the level, and publish to all screens. That is operations, not information technology for its own sake.",
    )
    body(
        doc,
        "The report module issues a ticket, records category, route, and narrative, and allows anonymous filing. Sitex sees new tickets first and forwards them to the cooperative head. This matches the institutional fact that SM Sorsogon / Sitex owns the terminal relationship while cooperatives own the buses.",
    )

    heading_sub(doc, "Advertisement space")
    body(
        doc,
        "A cinema-style slot, clearly labeled Advertisement, rotates poster or HD video creatives with sponsor, headline, caption, and a button. Staff upload a file or paste a URL, preview, and publish. Empty, the slot still says that the screen is for Sorsogon partners. This gives SM a commercial language without hiding the ad as if it were an arrival.",
    )

    caption(doc, "Table 6. Sitex Horizon Modules and MBA Operations Functions")
    simple_table(
        doc,
        ["Module", "Operations function", "Stakeholder served"],
        [
            ["Live board + map", "Service reliability / queue information", "Passengers, Sitex"],
            ["ETA engine", "Capacity of waiting time as a known wait", "Passengers, dispatch"],
            ["Announcement", "Crisis communication / RA 10121 spirit", "Public, LGU, DRRM"],
            ["Reports", "Voice of the customer / quality loop", "Sitex, cooperatives"],
            ["Driver GPS", "Shop-floor telemetry without new hardware", "Drivers, conductors"],
            ["Ad studio", "Revenue support for a free public board", "SM, partners"],
            ["Staff PIN 4700", "Access control on a public kiosk", "Sitex / SM staff"],
        ],
        col_widths=[1.7, 2.5, 2.0],
    )

    heading_section(doc, "Functional Completeness versus the Statement of the Problem")
    body(
        doc,
        "SOP 2 can already be answered by inspection of the working prototype. Table 7 is a completeness matrix. A module is “present” if it runs on the prototype demonstrated to the Graduate School.",
    )
    caption(doc, "Table 7. Functional Completeness of the Prototype versus the SOP")
    simple_table(
        doc,
        ["SOP item", "Present in prototype", "Notes"],
        [
            ["2.1 Live GPS + continuous ETA", "Yes", "Phone GPS and demo telemetry"],
            ["2.2 Sixteen LGUs with road km", "Yes", "ZIP 4700–4715; Table 1"],
            ["2.3 Huge editable announcement", "Yes", "Critical / caution / info + hotlines"],
            ["2.4 Passenger report to Sitex/coops", "Yes", "Ticket + forward"],
            ["2.5 Driver/conductor phone GPS", "Yes", "Android and iOS Geolocation API"],
            ["2.6 Poster or video advertisement", "Yes", "Admin studio, labeled slot"],
            ["Internet-required live updates", "Yes", "Board shows live cloud / offline"],
        ],
        col_widths=[2.4, 1.5, 2.3],
    )
    body(
        doc,
        "Interpretation. The developmental objective is met: a working system exists that covers the specified modules. What remains is not invention of features but empirical judgment by users (SOP 3) and an agreed implementation path (SOP 4).",
    )

    heading_section(doc, "Functional Quality (SOP 3) — Matrix for Field Survey")
    body(
        doc,
        "SOP 3 will be answered by the weighted means of Appendix G. Table 8 is the shell into which those means will be written. It is included now so that the oral-defense panel can see the exact analysis plan. Until rows are filled from real respondents, no verbal interpretation of “highly acceptable” is claimed.",
    )
    caption(doc, "Table 8. ISO/IEC 25010 Evaluation Matrix (to be accomplished after field survey)")
    simple_table(
        doc,
        ["Characteristic", "Sample indicators", "WM", "Interpretation"],
        [
            ["Functional suitability", "ETA matches the live speed; LGU list complete", "—", "Pending"],
            ["Performance efficiency", "Board updates without long freeze", "—", "Pending"],
            ["Usability", "Passengers can read ETA at a distance; PIN pad clear", "—", "Pending"],
            ["Reliability", "Offline state is shown; no false ETA at speed 0", "—", "Pending"],
            ["Security", "Staff PIN; no passenger tracking", "—", "Pending"],
            ["Maintainability", "Staff can edit announcement and ads without a programmer", "—", "Pending"],
            ["Overall", "", "—", "Pending"],
        ],
        col_widths=[1.7, 2.5, 0.8, 1.2],
    )
    body(
        doc,
        "A formative, non-statistical walkthrough by the researcher notes the following already visible behaviors of the prototype, which the survey will later confirm or contradict: the PIN is four centered boxes so that each digit is fully shown; the public board labels advertisements as advertisements; remaining kilometers use Table 1, not straight-line distance; and a typhoon weather state forces a critical announcement. These are design claims, not sample statistics.",
    )

    heading_section(doc, "Proposed Implementation Model (SOP 4)")
    body(
        doc,
        "SOP 4 asks how Sitex, SM Sorsogon, cooperatives, and the LGU should run the system if they accept the free offer.",
    )
    caption(doc, "Table 9. Proposed Implementation Roles of Stakeholders")
    simple_table(
        doc,
        ["Stakeholder", "Role", "First 90 days"],
        [
            ["SM Sorsogon / Sitex", "Owner of the public screens and PIN", "Mount one TV; change PIN; assign two clerks"],
            ["Bus cooperatives", "Require on-duty GPS share", "Pilot five units per major route"],
            ["Drivers / conductors", "Start trip and allow location", "Short training before first trip"],
            ["City / PDRRMO", "Supply hotlines and ordinances", "MoA for critical announcements"],
            ["Researcher", "Turn over the prototype without fee", "Training and one revision cycle"],
            ["Passengers", "Read the board; file reports in good faith", "Poster in Filipino and English"],
        ],
        col_widths=[1.8, 2.2, 2.2],
    )
    body(
        doc,
        "The recommended architecture is simple on purpose. A screen at the waiting bay runs the terminal board. Drivers use the driver page on the phones they already carry. Sitex clerks use Sitex Control on an office PC. All require internet. Data that must survive across devices (announcements, reports, ads) should later move from local device storage to a small cloud database under a Data Privacy Act privacy notice. The researcher is willing to assist that move as further development, still for Sorsogon, not as a paid lock-in.",
    )
    caption(doc, "Figure 5. Implementation architecture (conceptual)")
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.5)
    add_text(p, "Driver phone GPS  →  internet  →  Sitex Horizon  →  public TV / passenger phone", bold=True, size=11)
    p = doc.add_paragraph()
    set_paragraph_format(p, align="center", line=1.0, space_after=12)
    add_text(p, "Sitex Control (PIN) sets announcements, weather, ads, and forwards reports to cooperatives.", size=10, italic=True)

    body(
        doc,
        "Interpretation. The implementation model is a stakeholder contract. SM supplies the glass and the electricity already present in a modern terminal. Cooperatives supply compliance of drivers. The City supplies legitimate emergency text. The researcher supplies the system without charging the riding public. That is the MBA contribution: not code for its own sake, but an operations arrangement that can actually run at Balogo.",
    )

    # ========== CHAPTER 5
    doc.add_page_break()
    heading_chapter(doc, "5", "Summary, Conclusions and Recommendations")
    heading_section(doc, "Summary")
    body(
        doc,
        "This descriptive-developmental study addressed the uncertainty of waiting for provincial buses at the Sorsogon Integrated Terminal Exchange. Anchored on Maister’s psychology of waiting, SERVQUAL, the Technology Acceptance Model, stakeholder theory, and a kinematics identity for expected time of arrival, the researcher designed and built Sitex Horizon, a real-time monitoring and passenger information system that uses the built-in GPS of drivers’ and conductors’ Android and iOS phones, official road kilometers for all sixteen Sorsogon LGUs, a huge editable announcement board, a passenger report path to Sitex and cooperative heads, and a labeled advertisement studio.",
    )
    body(
        doc,
        "The prototype is internet-connected. ETA updates when velocity changes. The public board does not invent an arrival when a bus is stopped. Staff enter Sitex Control with a four-digit PIN. The work is offered free to Sitex and SM Sorsogon for further development in the service of passengers.",
    )
    body(
        doc,
        "Field evaluation instruments are complete in the appendices. Statistical tests of perceived uncertainty and of ISO/IEC 25010 ratings will be run after ethics clearance. This manuscript does not substitute invented numbers for those tests.",
    )

    heading_section(doc, "Findings")
    body(
        doc,
        "On SOP 1. The design brief, pending survey quantification, is that SITEX passengers lack live arrival information, experience high waiting uncertainty, lack a huge instant announcement channel for weather and ordinances, and lack a ticketed report path. This brief is consistent with foreign and local literature on uninformed waits.",
    )
    body(
        doc,
        "On SOP 2. A working prototype was developed with all specified modules: live GPS and continuous ETA, sixteen-LGU coverage with ZIP Codes and road kilometers, editable announcements with hotlines, passenger reports, driver-phone GPS, and poster/video advertisements.",
    )
    body(
        doc,
        "On SOP 3. Functional completeness is demonstrated. User-perceived quality awaits the field survey. No weighted mean is reported as if it were already gathered.",
    )
    body(
        doc,
        "On SOP 4. An implementation model assigning roles to SM/Sitex, cooperatives, drivers, the City/PDRRMO, the researcher, and passengers is proposed, with a ninety-day pilot of screens and of a small number of buses per major route.",
    )

    heading_section(doc, "Conclusions")
    body(
        doc,
        "Based on the developmental output, the following conclusions are drawn:",
    )
    body(
        doc,
        "1. Waiting at SITEX is not only a matter of how many buses exist. It is a matter of whether passengers can know if a bus on their route is still coming and when it will arrive.",
        indent=True,
    )
    body(
        doc,
        "2. A real-time system that uses the phone GPS already in the cab, official road kilometers, and a live ETA formula is technically and managerially feasible for a provincial integrated terminal.",
        indent=True,
    )
    body(
        doc,
        "3. Public announcements for typhoon and ordinance, passenger reports to cooperatives, and honest advertisement space belong in the same operations system because a terminal is a service firm with many stakeholders, not a clock on a wall.",
        indent=True,
    )
    body(
        doc,
        "4. The prototype is ready to be shown to SM Sorsogon, Sitex, cooperatives, and the Graduate School. It is not yet a completed statistical evaluation of user acceptance. That honesty is itself a conclusion required by CHED graduate standards.",
        indent=True,
    )

    heading_section(doc, "Recommendations")
    body(
        doc,
        "To Sitex and SM Sorsogon. Accept a no-fee demonstration on one public screen. Change the staff PIN. Assign clerks to announcements and reports. Treat the advertisement slot as a managed partner space.",
    )
    body(
        doc,
        "To bus cooperatives and corporations. Pilot GPS sharing on a few units per destination, with a simple start-trip / end-trip discipline for drivers and conductors.",
    )
    body(
        doc,
        "To the City Government of Sorsogon and the PDRRMO. Supply official hotlines and a protocol for critical announcements so that the board never carries an unofficial panic message.",
    )
    body(
        doc,
        "To the Graduate School. Allow this manuscript as a professional-track thesis or capstone under CMO No. 15, s. 2019, and require the field-survey insert in Chapter 4 as the condition for final binding.",
    )
    body(
        doc,
        "To the proponent. Administer the instruments, fill Tables 8 and the SOP 1 baseline, test the hypotheses, prepare a short journal article for a refereed or institutional outlet if the School requires publication evidence, and keep the offer to Sorsogon free.",
    )
    body(
        doc,
        "To future researchers. Replicate in Matnog port, in municipal terminals, and with actual LTFRB-authorized GPS devices should cooperatives later prefer dedicated trackers. Compare perceived wait before and after with a proper control week.",
    )

    # ========== REFERENCES (APA 7)
    doc.add_page_break()
    centered(doc, "REFERENCES", bold=True, size=14)
    blank(doc, 1)

    refs = [
        "Brakewood, C., Macfarlane, G. S., & Watkins, K. (2015). The impact of real-time information on bus ridership in New York City. Transportation Research Part C: Emerging Technologies, 53, 59–75. https://doi.org/10.1016/j.trc.2015.01.021",
        "Bongalonta, M. B., & Bongalonta, M. M. (2022). The liquidity issues and the profitability index of small-scale business entities in Sorsogon Province, Philippines. International Journal of Multidisciplinary: Applied Business and Education Research, 3(9), 1654–1663. https://doi.org/10.11594/ijmaber.03.09.06",
        "Calderon, J. F., & Gonzales, E. C. (1993). Methods of research and thesis writing. National Book Store.",
        "Commission on Higher Education. (2019). Policies, standards, and guidelines for graduate programs (CMO No. 15, s. 2019). CHED.",
        "Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340. https://doi.org/10.2307/249008",
        "Department of Transportation. (n.d.). Public Utility Vehicle Modernization Program. Republic of the Philippines.",
        "Falcon, I. G., Dugaria, K. J. L., & Remojo, D. C. (2025). A three-tier integrated queue management system: Optimized service delivery for land transportation clients. ITEGAM-JETIA.",
        "Freeman, R. E. (1984). Strategic management: A stakeholder approach. Pitman.",
        "International Organization for Standardization. (2011). Systems and software engineering — Systems and software quality requirements and evaluation (SQuaRE) — System and software quality models (ISO/IEC 25010:2011).",
        "Little, J. D. C. (1961). A proof for the queuing formula: L = λW. Operations Research, 9(3), 383–387. https://doi.org/10.1287/opre.9.3.383",
        "Maister, D. H. (1985). The psychology of waiting lines. In J. A. Czepiel, M. R. Solomon, & C. F. Surprenant (Eds.), The service encounter (pp. 113–123). Lexington Books.",
        "Maraño, R. F., & Chua, V. L. (2025). Enhancing school-based management in Gubat South District: An analysis of its implementation and challenges. United International Journal for Research & Technology, 6(6).",
        "Mijares, A. C., Suzuki, M., & Yai, T. (2016). Passenger satisfaction and mental adaptation under adverse conditions: Case study in Manila. Journal of the Eastern Asia Society for Transportation Studies, 11, 2474–2489. (Related MRT-3 waiting studies by the same authors, 2013–2016.)",
        "Nunnally, J. C. (1978). Psychometric theory (2nd ed.). McGraw-Hill.",
        "Official Gazette. (2010). Republic Act No. 10121: Philippine Disaster Risk Reduction and Management Act of 2010.",
        "Official Gazette. (2012). Republic Act No. 10173: Data Privacy Act of 2012.",
        "Parasuraman, A., Zeithaml, V. A., & Berry, L. L. (1988). SERVQUAL: A multiple-item scale for measuring consumer perceptions of service quality. Journal of Retailing, 64(1), 12–40.",
        "Richey, R. C., & Klein, J. D. (2007). Design and development research: Methods, strategies, and issues. Lawrence Erlbaum.",
        "Tang, L., & Thakuriah, P. (2012). Ridership effects of real-time bus information system: A case study in the City of Chicago. Transportation Research Part C: Emerging Technologies, 22, 146–161. https://doi.org/10.1016/j.trc.2012.01.001",
        "The Manila Times. (2022, November 3). SM opens 4th mall in Bicol in Sorsogon.",
        "Venkatesh, V., Morris, M. G., Davis, G. B., & Davis, F. D. (2003). User acceptance of information technology: Toward a unified view. MIS Quarterly, 27(3), 425–478. https://doi.org/10.2307/30036540",
        "Watkins, K. E., Ferris, B., Borning, A., Rutherford, G. S., & Layton, D. (2011). Where Is My Bus? Impact of mobile real-time information on the perceived and actual wait time of transit riders. Transportation Research Part A: Policy and Practice, 45(8), 839–848. https://doi.org/10.1016/j.tra.2011.06.010",
        "World Wide Web Consortium. (n.d.). Geolocation API specification. https://www.w3.org/TR/geolocation/",
        "Springer. (2024). JeePS: Designing a realtime public transportation tracking system. In conference proceedings (HCI / transportation systems). Springer. https://doi.org/10.1007/978-3-031-73344-4_35",
    ]
    for r in sorted(refs, key=lambda s: s.lower()):
        p = doc.add_paragraph()
        pf = p.paragraph_format
        pf.line_spacing_rule = WD_LINE_SPACING.DOUBLE
        pf.first_line_indent = Inches(-0.5)
        pf.left_indent = Inches(0.5)
        pf.space_after = Pt(0)
        pf.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        add_text(p, r)

    # ========== APPENDICES
    doc.add_page_break()
    centered(doc, "APPENDICES", bold=True, size=14)

    def appendix(letter, title):
        doc.add_page_break()
        centered(doc, f"APPENDIX {letter}", bold=True)
        centered(doc, title.upper(), bold=True)
        blank(doc, 1)

    appendix("A", "Letter to the Dean / Adviser")
    p = doc.add_paragraph()
    set_paragraph_format(p, align="right", line=2.0)
    add_text(p, "Date: ____________________")
    body(doc, f"The Dean, Graduate School", indent=False)
    body(doc, f"{SCHOOL.title()}", indent=False)
    body(doc, "Sorsogon City", indent=False)
    body(doc, "Madam / Sir:", indent=False)
    body(
        doc,
        f"I have the honor to submit this thesis entitled “{TITLE}” in partial fulfillment of the requirements for the degree of {DEGREE}. I request endorsement to conduct the field survey at SITEX / SM Sorsogon and among cooperating bus operators after ethics review.",
    )
    body(doc, "Very truly yours,", indent=False)
    blank(doc, 2)
    body(doc, PROPONENT, indent=False)
    body(doc, "Researcher", indent=False)
    blank(doc, 1)
    body(doc, "Noted:", indent=False)
    blank(doc, 2)
    body(doc, "________________________________", indent=False)
    body(doc, "Adviser", indent=False)

    appendix("B", "Letter to SM Sorsogon / Sitex Management")
    body(doc, "The Terminal / Mall Management", indent=False)
    body(doc, "SM City Sorsogon / Sorsogon Integrated Terminal Exchange", indent=False)
    body(doc, "Barangay Balogo, Sorsogon City", indent=False)
    body(doc, "Madam / Sir:", indent=False)
    body(
        doc,
        "I am a graduate student in Business Administration at Saint Louise de Marillac College of Sorsogon. I developed Sitex Horizon, a real-time bus monitoring and passenger information system, and I offer it free for public use at SITEX. I respectfully request permission to demonstrate the prototype on the premises and to administer a short voluntary survey to waiting passengers and staff. No commercial use of SM trademarks beyond factual identification of the locale is intended. Passenger data will not be sold.",
    )
    body(doc, "Very truly yours,", indent=False)
    blank(doc, 2)
    body(doc, PROPONENT, indent=False)

    appendix("C", "Letter to Bus Cooperatives")
    body(
        doc,
        "The Manager / Chairperson, [Name of Cooperative or Corporation]: I am conducting an MBA study on real-time passenger information at SITEX. The system uses the ordinary smartphone of the driver or conductor (Android or iOS) to share live location and speed while on a trip. I request the participation of selected units for a pilot and the response of management to a short evaluation checklist. Participation is voluntary. The public board will show plate, route, remaining kilometers, speed, and ETA—not private phone numbers.",
    )

    appendix("D", "Informed Consent Form")
    body(
        doc,
        "You are invited to answer a questionnaire about waiting for buses at SITEX and about a live monitoring prototype. You must be 18 years old or above. You may refuse or stop at any time without penalty. Your name is not required. Data will be used only for this MBA thesis and for improving a free public system. By answering, you agree to participate.",
    )
    body(doc, "Signature / mark (optional): _____________________  Date: __________", indent=False)

    appendix("E", "Survey Questionnaire for Passengers")
    body(doc, "Part I. Profile (check one)", indent=False)
    bullet(doc, "Sex:  [ ] Male  [ ] Female  [ ] Prefer not to say")
    bullet(doc, "Age:  [ ] 18–25  [ ] 26–40  [ ] 41–59  [ ] 60 and above")
    bullet(doc, "Usual destination LGU: ________________ ZIP if known: ________")
    bullet(doc, "Frequency at SITEX:  [ ] Daily  [ ] Weekly  [ ] Monthly  [ ] Rarely")
    body(doc, "Part II. Present waiting experience. Encircle 4 Strongly agree, 3 Agree, 2 Disagree, 1 Strongly disagree.", indent=False)
    items = [
        "I usually know when the next bus to my destination will arrive.",
        "I can see whether a bus on my route is already on the way.",
        "Waiting at SITEX makes me anxious because I cannot measure my time.",
        "I rely on hearsay or on asking conductors about arrivals.",
        "I am informed when travel is limited or suspended because of weather or ordinance.",
        "I know where to report a bad experience so that the cooperative will hear it.",
        "A live screen of bus location would help me decide whether to wait.",
        "A large announcement during a typhoon would make me feel safer.",
    ]
    for i, it in enumerate(items, 1):
        bullet(doc, f"{i}. {it}    4   3   2   1")
    body(doc, "Part III. After viewing Sitex Horizon (same scale).", indent=False)
    after = [
        "I can read the expected arrival of buses to my municipality.",
        "The remaining kilometers and speed help me trust the time shown.",
        "The announcement is large enough to notice.",
        "The report button is something I would use.",
        "I would like this system to remain at SITEX.",
    ]
    for i, it in enumerate(after, 1):
        bullet(doc, f"{i}. {it}    4   3   2   1")

    appendix("F", "Survey Questionnaire for Drivers and Conductors")
    bullets = [
        "I am willing to share this phone’s GPS while I am on a trip for SITEX monitoring.",
        "Sharing location is easy enough that it will not distract me from driving.",
        "Live ETA that follows my speed is fair to passengers.",
        "I prefer this to being asked about arrival time all day.",
        "My cooperative should require on-duty sharing.",
    ]
    body(doc, "Encircle 4 Strongly agree to 1 Strongly disagree.", indent=False)
    for i, it in enumerate(bullets, 1):
        bullet(doc, f"{i}. {it}    4   3   2   1")
    body(doc, "Phone:  [ ] Android  [ ] iPhone     Role:  [ ] Driver  [ ] Conductor", indent=False)

    appendix("G", "Evaluation Checklist for Administrators (ISO/IEC 25010)")
    body(doc, "Rate each indicator 4–1. Add comments.", indent=False)
    for ch, inds in [
        ("Functional suitability", ["All sixteen LGUs appear with km and ZIP.", "ETA changes when speed changes.", "Announcement publishes to the public board."]),
        ("Performance efficiency", ["The live board remains usable on terminal internet.", "Video advertisement does not freeze arrivals."]),
        ("Usability", ["Clerks can publish an announcement without a technician.", "The PIN pad shows four digits fully, centered."]),
        ("Reliability", ["Offline status is visible.", "No ETA is shown when the bus is stopped."]),
        ("Security", ["Staff functions require the PIN.", "Passenger phones are not tracked."]),
        ("Maintainability", ["Ads and hotlines can be edited by Sitex staff.", "PIN can be changed by management."]),
    ]:
        heading_sub(doc, ch)
        for ind in inds:
            bullet(doc, f"{ind}    4   3   2   1")

    appendix("H", "Interview Guide")
    for q in [
        "How do passengers presently learn about the next bus?",
        "What happens at SITEX when a typhoon or ordinance stops travel?",
        "Would cooperatives accept phone-GPS sharing as an operations rule?",
        "Who should own the staff PIN and the advertisement slot?",
        "What would make this free system fail in the first ninety days?",
    ]:
        bullet(doc, q)

    appendix("I", "Validation Sheet for Research Instruments")
    body(
        doc,
        "To the expert validator: Please rate each part of the instrument as 4 Very relevant, 3 Relevant, 2 Needs revision, 1 Not relevant, and write comments. Sign below.",
    )
    simple_table(
        doc,
        ["Part", "Rating (4–1)", "Comments"],
        [
            ["Passenger questionnaire", "", ""],
            ["Driver questionnaire", "", ""],
            ["ISO 25010 checklist", "", ""],
            ["Interview guide", "", ""],
            ["Clarity of Filipino/English wording", "", ""],
        ],
        col_widths=[2.4, 1.4, 2.4],
    )
    blank(doc, 1)
    body(doc, "Validator: _____________________  Degree / Position: _____________________", indent=False)
    body(doc, "Institution: _____________________  Date: __________  Signature: __________", indent=False)

    appendix("J", "Sample Public Announcements and Hotlines")
    body(doc, "Critical — No travel today", indent=False)
    body(
        doc,
        "Due to typhoon signal and LGU ordinance, all trips are suspended until further notice. INGAT PO ANG LAHAT. Tumawag sa mga hotline kung may emergency.",
    )
    body(doc, "Caution — Limited service", indent=False)
    body(
        doc,
        "Due to bad weather, only two to five buses are operating today on selected routes. Check live arrivals on this board.",
    )
    body(doc, "Information — Service resumed", indent=False)
    body(doc, "Normal operations have resumed. Thank you for your patience.")
    body(doc, "Suggested hotline placeholders (replace with official numbers before production):", indent=False)
    bullet(doc, "PDRRMO Sorsogon: ____________________")
    bullet(doc, "Sorsogon City CDRRMO: ____________________")
    bullet(doc, "Philippine National Police (local): ____________________")
    bullet(doc, "Sitex operations: ____________________")
    bullet(doc, "National Emergency: 911")

    appendix("K", "Notes to the Proponent (CHED Alignment and Remaining Field Work)")
    body(
        doc,
        "This manuscript follows the five-chapter Philippine graduate thesis form used by CHED-recognized higher education institutions: preliminaries, The Problem and Its Background, Review of Related Literature and Studies, Research Methodology, Presentation, Analysis and Interpretation of Data, Summary, Conclusions and Recommendations, APA-style references, and appendices. Mechanical specifications: ISO A4 (210 × 297 mm), Times New Roman 12, double spacing, 1.5-inch left margin for binding, 1-inch other margins, first-line paragraph indent, Roman pagination for preliminaries, and Arabic pagination for the body.",
    )
    body(
        doc,
        "Under CMO No. 15, s. 2019, an MBA is generally a professional master’s degree. The Graduate School may classify this work as a thesis or as a capstone project. Either way, the School may still require an oral defense, a bound copy, and, if it applies the academic-track publication rule to your cohort, a paper drawn from this study in a refereed journal or institutional research journal. Ask the Dean in writing which track your enrolment follows.",
    )
    body(
        doc,
        "Before oral defense, replace every bracketed placeholder: your full name as enrolled, adviser, panel, dean, survey dates, official hotlines, and cooperative names. After ethics clearance, gather the 170 proposed respondents (or the number your adviser approves), encode the Likert responses, compute weighted means and tests, and replace Table 8 and the SOP 1 discussion with real figures. Do not invent statistics.",
    )
    body(
        doc,
        "Staff PIN for the prototype is 4700 (Sorsogon ZIP). Change it when Sitex takes over. The system is offered free, para sa mga Sorsogon.",
    )

    # CV
    doc.add_page_break()
    centered(doc, "CURRICULUM VITAE", bold=True, size=14)
    blank(doc, 1)
    body(doc, f"Name: {PROPONENT}", indent=False)
    body(doc, "Address: Sorsogon Province, Philippines", indent=False)
    body(doc, "Email: [your email]", indent=False)
    heading_sub(doc, "Educational background")
    body(doc, f"Graduate: {DEGREE}, {SCHOOL.title()} (ongoing)", indent=False)
    body(doc, "Baccalaureate: [Degree, School, Year]", indent=False)
    heading_sub(doc, "Research interest")
    body(
        doc,
        "Service operations, public-transport passenger information, and the use of ordinary smartphones as ethical telemetry for provincial terminals.",
        indent=False,
    )
    heading_sub(doc, "Statement")
    body(
        doc,
        "The proponent is a passenger of SITEX and offers Sitex Horizon without fee for further development and public use in Sorsogon.",
        indent=False,
    )

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    import shutil

    for dest in COPIES:
        dest.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(OUT, dest)
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    build()
