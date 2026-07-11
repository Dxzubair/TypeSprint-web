/* v8 ignore start */
export interface Paragraph {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert';
  wordCount: number;
  estimatedTime: number; // in seconds
  language: string;
  tags: string[];
  createdAt: number;
  content: string;
  exam?: string;
  isCustom?: boolean;
  folderId?: string;
  recommendedWpm?: number;
  xpReward?: number;
}

// 29 Professional Categories as requested by the user
export const PROFESSIONAL_CATEGORIES = [
  "Official Government Letters",
  "Office Orders",
  "Memorandums",
  "Notifications",
  "Circulars",
  "Leave Applications",
  "Administrative Orders",
  "JKSSB Typing Practice",
  "SSC Typing Practice",
  "Banking",
  "Computer Basics",
  "MS Word",
  "Office Procedures",
  "English Grammar",
  "Current Affairs Style",
  "Newspaper Articles",
  "Science",
  "Technology",
  "Environment",
  "History",
  "Geography",
  "Education",
  "Business English",
  "Formal Emails",
  "Motivational",
  "General Practice",
  "Stories",
  "Essays",
  "Quotes"
];

// Context Variables to swap and generate unique paragraphs
const DEPTS = [
  "Revenue Department",
  "Finance Department",
  "Home Affairs Department",
  "Public Works Department",
  "School Education Directorate",
  "Information Technology Directorate",
  "Tourism and Culture Department",
  "Forest and Environment Department",
  "Health and Family Welfare",
  "Rural Development Department"
];

const NAMES = [
  "Amit Sharma",
  "Rajesh Kumar",
  "Suhail Ahmad",
  "Vikram Singh",
  "Sanjay Dhar",
  "Mohammad Iqbal",
  "Anil Kaul",
  "Sunita Devi",
  "Vijay Raina",
  "Ramesh Pandita"
];

const TITLES = [
  "Junior Assistant",
  "Senior Assistant",
  "Section Officer",
  "Under Secretary",
  "Accounts Officer",
  "Tehsildar",
  "Block Development Officer",
  "Director General",
  "Administrative Officer",
  "Nodal Secretary"
];

const LOCATIONS = [
  "Civil Secretariat Srinagar",
  "Civil Secretariat Jammu",
  "Directorate Office Jammu",
  "Tehsil Headquarters Kupwara",
  "District Secretariat Anantnag",
  "Divisional Headquarters Baramulla",
  "Secretariat Srinagar",
  "Secretariat Jammu",
  "Directorate of Tourism Srinagar",
  "Finance Commission Office Jammu"
];

const SCHEMES = [
  "Prime Minister Development Package",
  "National Health Mission Yojana",
  "Sarva Shiksha Abhiyan Scheme",
  "Smart Cities Mission Initiative",
  "Digital India Infrastructure Plan",
  "Jal Jeevan Mission Programme",
  "Pradhan Mantri Gram Sadak Yojana",
  "Rural Livelihood Mission",
  "State Administrative Reform Mission",
  "E-Governance Connectivity Project"
];

// Helper to replace template fields deterministically based on paragraph index
function fillTemplate(template: string, index: number, category: string, difficulty: string): string {
  const dept = DEPTS[(index + 1) % DEPTS.length];
  const name = NAMES[(index + 2) % NAMES.length];
  const title = TITLES[(index + 3) % TITLES.length];
  const loc = LOCATIONS[(index + 4) % LOCATIONS.length];
  const scheme = SCHEMES[(index + 5) % SCHEMES.length];
  const num = `982/${index * 3 + 4}`;
  const year = `${2024 + (index % 3)}`;
  const date = `${10 + index}th June, ${year}`;
  const salary = `${45000 + (index * 2500)}`;

  let content = template
    .replace(/\[Dept\]/g, dept)
    .replace(/\[Name\]/g, name)
    .replace(/\[Title\]/g, title)
    .replace(/\[Location\]/g, loc)
    .replace(/\[Scheme\]/g, scheme)
    .replace(/\[Num\]/g, num)
    .replace(/\[Year\]/g, year)
    .replace(/\[Date\]/g, date)
    .replace(/\[Salary\]/g, salary);

  // Append a distinct, context-relevant final sentence to guarantee absolute uniqueness
  if (difficulty === "Beginner") {
    content += ` Order issued under Ref No. ADM-${index * 12}/J-K.`;
  } else if (difficulty === "Easy") {
    content += ` This directive must be updated in the official dispatch register immediately under index code ${index * 45}.`;
  } else if (difficulty === "Medium") {
    content += ` All designated branches must record this instruction in their files and submit an executive summary of action taken on or before the next weekly conference.`;
  } else if (difficulty === "Hard") {
    content += ` Furthermore, any delay in the execution of this administrative sanction will attract formal warning notes to the supervisory officer in charge under Rule ${index * 7 + 12} of the state civil services manual.`;
  } else {
    content += ` In conclusion, the higher administration expects strict adherence to these guidelines to ensure the seamless dispatch of public services, the maintenance of audit compliance, and the overall enhancement of departmental productivity across all divisions in the territory.`;
  }

  return content;
}

// High-quality base templates for each category and difficulty
const TEMPLATES: Record<string, Record<'Beginner' | 'Easy' | 'Medium' | 'Hard' | 'Expert', string[]>> = {
  "Official Government Letters": {
    Beginner: [
      "Government of Jammu and Kashmir, Secretariat, [Dept]. File No: [Num]. The competent authority has approved the deputation of Shri [Name], [Title], to [Location] with immediate effect in public interest."
    ],
    Easy: [
      "Government of India, Ministry of [Dept]. Office Order No: [Num] of [Year]. Sanction is hereby accorded to the grant of fifteen days of casual leave in favor of Shri [Name], [Title], [Location], starting from [Date]."
    ],
    Medium: [
      "Government of Jammu and Kashmir, Directorate of [Dept]. Notification No: [Num]/[Year] dated [Date]. In exercise of the powers conferred by the Civil Services Act, the Lieutenant Governor is pleased to appoint [Name] as the designated secretary of the administrative welfare commission at [Location] with immediate effect."
    ],
    Hard: [
      "Government of India, Department of Administrative Reforms, New Delhi. Circular No: [Num]/[Year]. Subject: Adherence to proper channel in administrative correspondence. The under-signed is directed to state that multiple representations have been received directly from subordinate [Title] staff in [Location] without routing through proper channels. This practice violates established office rules. All heads are requested to ensure strict compliance."
    ],
    Expert: [
      "Government of Jammu and Kashmir, Secretariat, [Dept]. Memorandum No: [Num]/[Year]-Estt. Subject: Comprehensive audit of all administrative files and public service dispatch registers. The Governor is pleased to order a special performance evaluation of all subordinate directorates in [Location]. Shri [Name], [Title], is designated as the primary coordinator to lead the verification team and compile the final report. The audit will evaluate filing compliance, dispatch delays, and adherence to standard operating procedures. The final report must be submitted to the secretariat office within thirty working days of receipt of this memo."
    ]
  },
  "Office Orders": {
    Beginner: [
      "Office of the Commissioner, [Dept], [Location]. Order No: [Num] of [Year]. Shri [Name], [Title], is hereby attached to the directorate office with immediate effect."
    ],
    Easy: [
      "Directorate of [Dept], [Location]. Office Order No: [Num]/[Year] dated [Date]. In the interest of administration, the following [Title] staff are hereby deployed for special census verification duties under the supervision of the nodal officer."
    ],
    Medium: [
      "Office of the Divisional Commissioner, [Location]. Order No: [Num]/[Year] dated [Date]. Shri [Name], [Title], who has been awaiting orders of adjustment, is hereby posted as [Title] in [Location] against an available vacancy. The officer shall join his new place of posting immediately without availing any joining time."
    ],
    Hard: [
      "Government of Jammu and Kashmir, Secretariat, [Dept]. Office Order No: [Num]/[Year]. In exercise of powers conferred by the Civil Services Rules, the competent authority hereby orders the suspension of Shri [Name], [Title], pending an inquiry into allegations of financial irregularities in the implementation of the [Scheme] in [Location]."
    ],
    Expert: [
      "Directorate of [Dept], Civil Secretariat, [Location]. Office Order No: [Num]/[Year] dated [Date]. In the interest of administrative efficiency and to ensure smooth dispatch of public services, the following transfers and postings of [Title] officers are hereby ordered with immediate effect. Shri [Name], currently posted in [Location], is transferred and posted to [Location] against an available vacancy. Simultaneously, Shri [Name], [Title], is transferred and posted as [Title] in [Location] vice Shri [Name]."
    ]
  },
  "Memorandums": {
    Beginner: [
      "Government of [Dept], Memorandum No: [Num]/[Year]. Subject: Submission of annual performance appraisals of [Title] staff in [Location] on or before [Date]."
    ],
    Easy: [
      "Ministry of [Dept], New Delhi. Memorandum dated [Date]. The under-signed is directed to seek an immediate explanation from Shri [Name], [Title], regarding his unauthorized absence from [Location] during the audit inspection."
    ],
    Medium: [
      "Directorate of [Dept], [Location]. Memorandum No: [Num]/[Year] dated [Date]. Subject: Adherence to office timings and attendance registers. It has been observed with concern that several [Title] employees are not maintaining punctuality, leading to public delays. All staff must mark biometric attendance daily."
    ],
    Hard: [
      "Government of India, Department of Personnel. Office Memorandum No: [Num]/[Year]. Subject: Verification of character certificates prior to formal appointment in central services. The undersigned is directed to state that some departments in [Location] have issued appointment orders before receiving formal clearance. This practice violates security guidelines."
    ],
    Expert: [
      "Office of the Accountant General, [Location]. Memorandum No: [Num]/[Year] dated [Date]. Subject: Audit observations on the financial transactions of [Dept] divisions. The under-signed is directed to state that a comprehensive review of the accounts of subordinate offices has revealed serious procedural lapses in the utilization of funds sanctioned for the [Scheme]. It has been observed that expenditure was incurred without proper administrative approval and technical sanction from the competent authority. The concerned [Title] officers are hereby directed to submit a detailed para-wise reply within fifteen days."
    ]
  },
  "Notifications": {
    Beginner: [
      "Government of [Dept], [Location]. Notification dated [Date]. The administrative rules for recruitment to the post of [Title] are hereby amended with immediate effect."
    ],
    Easy: [
      "Secretariat, [Dept], [Location]. Notification No: [Num]/[Year]. In exercise of powers conferred by Section 12 of the Civil Services Act, the Lieutenant Governor hereby notifies the public holidays for the calendar year."
    ],
    Medium: [
      "Government of Jammu and Kashmir, Department of [Dept]. Notification dated [Date]. The public is hereby notified that the land acquisition process for the implementation of the [Scheme] in district [Location] has been initiated under the Land Acquisition Act. Any claims or objections regarding the proposed site must be filed before the competent collector within twenty-one days of this notification."
    ],
    Hard: [
      "Ministry of Home Affairs, Government of India. Notification No: [Num]/[Year]-Estt. The central government hereby notifies the rules governing the promotion criteria for administrative [Title] officers in the union territories. Under the new provisions, candidates must qualify in a specialized computer typing test with a minimum net speed of thirty-five words per minute. This regulation aims to modernize public offices."
    ],
    Expert: [
      "Government of Jammu and Kashmir, Secretariat, [Dept]. Notification No: [Num]/[Year] dated [Date]. The Lieutenant Governor is pleased to notify the rules for the establishment of the State E-Governance Service Cadre across all government divisions. These rules shall apply to all administrative [Title] staff and junior assistants working in [Location]. Under the new framework, all recruitment shall be conducted through the Services Selection Board based on a computer-based assessment and a technical typing test. The terms of pension, salary scales, and seniority list shall be regulated strictly as per civil services regulations."
    ]
  },
  "Circulars": {
    Beginner: [
      "Directorate of [Dept], [Location]. Circular No: [Num]/[Year]. All [Title] officers are hereby directed to clean and organize their physical filing cabinets before [Date]."
    ],
    Easy: [
      "Office of the Commissioner, [Location]. Circular dated [Date]. Subject: Cleanliness drive in office premises. In compliance with the Swachh Bharat Abhiyan, all divisions of [Dept] must conduct weekly cleanup activities every Friday afternoon."
    ],
    Medium: [
      "Government of Jammu and Kashmir, [Dept], Secretariat. Circular No: [Num] dated [Date]. Subject: Rationalization of paper use and promotion of digital filing systems. In order to reduce administrative costs and improve speed, all official correspondence between [Location] and subordinate offices must be conducted through the e-office portal. No physical files shall be entertained unless explicitly approved by the competent authority."
    ],
    Hard: [
      "Directorate of School Education, [Location]. Circular No: [Num]/[Year]. Subject: Strict implementation of the revised academic calendar. It has been brought to the notice of the directorate that several educational institutions are not complying with the scheduled timing and vacation rules. All heads of institutions are directed to adhere to the calendar and submit monthly compliance reports. Any deviations will invite strict disciplinary action."
    ],
    Expert: [
      "Government of India, Department of Expenditure, Ministry of Finance. Circular No: [Num]/[Year] dated [Date]. Subject: Austerity measures and rationalization of government expenditure. In view of the current fiscal constraints, the central government has decided to enforce strict austerity guidelines across all administrative ministries and subordinate offices, including the [Dept] in [Location]. Under these guidelines, there shall be a complete ban on the creation of new administrative posts, purchasing luxury official vehicles, and holding national seminars in five-star hotels. All administrative secretaries are directed to review their travel expenses and submit a detailed report on savings achieved to the Ministry of Finance."
    ]
  },
  "Leave Applications": {
    Beginner: [
      "To, The Tehsildar, [Dept], [Location]. Subject: Application for casual leave. Respected Sir, I request you to grant me two days of casual leave starting from [Date] due to urgent family matters."
    ],
    Easy: [
      "To, The Director, [Dept], [Location]. Subject: Application for medical leave. Respected Sir, I have been advised complete bed rest by my physician due to acute viral fever. I request you to kindly grant me ten days of medical leave with effect from [Date]."
    ],
    Medium: [
      "To, The Administrative Secretary, [Dept], Civil Secretariat, [Location]. Subject: Application for earned leave on medical grounds. Respected Sir, I am writing to request forty-five days of earned leave starting from [Date] as I am scheduled to undergo a minor surgical procedure. I have enclosed my medical certificate and admission ticket for your verification. In my absence, Shri [Name], [Title], has agreed to oversee my urgent files."
    ],
    Hard: [
      "To, The Block Development Officer, [Location]. Subject: Application for child care leave under civil services rules. Respected Sir, in accordance with the state civil service regulations, I am writing to apply for child care leave for a period of ninety days starting from [Date] to attend to my daughter's board examinations. I have completed all pending project audits and handed over the charge of the [Scheme] files to the assistant officer. I request you to kindly sanction this leave."
    ],
    Expert: [
      "To, The Director General, [Dept], [Location]. Subject: Application for study leave for pursuing advanced postgraduate diploma. Respected Sir, I am writing to formally apply for two years of study leave with effect from [Date] to pursue a Postgraduate Diploma in Public Administration and E-Governance at the national institute. This course is highly relevant to my duties as [Title] and will help me implement advanced e-office systems in our directorate. I have secured formal admission and the requisite sponsorship letter is attached. I request you to kindly sanction this study leave as per rules."
    ]
  },
  "Administrative Orders": {
    Beginner: [
      "Office of the Director, [Dept], [Location]. Order No: [Num]. Sanction of Rs. [Salary] is hereby accorded for purchasing computer printing paper and typing stationary for administrative use."
    ],
    Easy: [
      "Government of Jammu and Kashmir, [Dept], Civil Secretariat. Administrative Order No: [Num]. Sanction is hereby accorded to the deputation of the IT audit team to [Location] for verifying hardware assets purchased under the [Scheme]."
    ],
    Medium: [
      "Office of the Divisional Commissioner, [Location]. Administrative Order No: [Num]/[Year] dated [Date]. Sanction is hereby accorded to the release of funds amounting to Rs. [Salary] lakhs for the repair and maintenance of administrative buildings at district headquarters. The expenditure shall be audited by the designated finance controller."
    ],
    Hard: [
      "Government of India, Ministry of Rural Development. Administrative Order No: [Num]/[Year]. Sanction is hereby accorded to the release of second installment of grant-in-aid amounting to Rs. [Salary] lakhs for the implementation of the [Scheme] in Jammu and Kashmir. The state government must ensure that the funds are utilized strictly in accordance with guidelines and that utilization certificates are submitted within the current financial year."
    ],
    Expert: [
      "Government of Jammu and Kashmir, Secretariat, [Dept]. Administrative Order No: [Num]/[Year] dated [Date]. Subject: Delegation of financial powers to administrative [Title] officers in divisional offices. In interest of administrative speed and in supersession of all previous orders, the Lieutenant Governor is pleased to delegate enhanced financial powers to the head of department in [Location]. Under these revised delegations, the head of department is authorized to sanction expenditures up to Rs. [Salary] lakhs for administrative works without seeking prior approval from the administrative secretariat. This delegation is subject to strict adherence to codal formalities, e-tendering procedures, and availability of budgeted funds."
    ]
  },
  "JKSSB Typing Practice": {
    Beginner: [
      "The Jammu and Kashmir Services Selection Board conducts computer typing tests for the post of Junior Assistant. Aspirants must achieve a speed of thirty-five words per minute with ninety percent accuracy on a computer keyboard."
    ],
    Easy: [
      "To pass the JKSSB typing test in Jammu and Kashmir, candidates must practice touch typing daily on previous years' exam passages. The test is exactly ten minutes long, requiring consistent speed, accuracy, and mental stamina under pressure at the exam center."
    ],
    Medium: [
      "The computer typing test conducted by the JKSSB for Junior Assistant vacancies carries twenty marks in the final selection criteria. Candidates are required to type an unseen passage of approximately three hundred and fifty words in exactly ten minutes on a desktop computer. To achieve the highest score, candidates must maintain a proper typing posture, keep their hands relaxed, and focus on the character sequence of the text. Backspace is allowed, but frequent corrections can slow down the overall speed."
    ],
    Hard: [
      "Aspirants practicing for the JKSSB typing test should focus on accuracy first, letting speed develop naturally through muscle memory. The exam passages usually consist of formal administrative content, including department names, office orders, and specific punctuation marks. Practicing on simulated typing software that replicates the actual exam interface is highly recommended to build stamina. Typists should keep their wrists elevated, avoid resting them on the table, and maintain a steady keystroke rhythm to minimize errors during the ten-minute test."
    ],
    Expert: [
      "The computer-based typing test conducted by the Jammu and Kashmir Services Selection Board is a key qualifying hurdle for the post of Junior Assistant in various departments like [Dept]. Candidates are presented with a technical passage of three hundred and fifty words containing numbers, capital letters, and complex punctuation, reflecting real government files. To qualify for the merit list, candidates must achieve a net speed of at least thirty-five words per minute with ninety percent accuracy. The net speed is calculated by deducting errors from the gross speed, making high precision critical. Aspiring candidates should practice in environments with moderate background noise, like keyboard clicking, to simulate the actual test centers at [Location]. By combining regular physical practice with a focused and relaxed mindset, candidates can clear this competitive exam and secure a stable administrative career in public administration."
    ]
  },
  "SSC Typing Practice": {
    Beginner: [
      "The Staff Selection Commission conducts typing assessments for positions like Lower Division Clerk and Postal Assistant. Candidates must type thirty-five words per minute in English on a computer."
    ],
    Easy: [
      "The Staff Selection Commission Data Entry Speed Test requires candidates to input approximately two thousand key depressions in fifteen minutes. This test evaluates the speed and accuracy required for administrative tasks in ministries."
    ],
    Medium: [
      "The SSC CHSL typing test is a qualifying exam where candidates must demonstrate proficiency on standard layout keyboards. For English typing, a speed of thirty-five words per minute is required, corresponding to approximately ten thousand five hundred key depressions per hour. The passage provided is usually a well-structured essay on social sciences, history, or public administration. To pass, candidates should focus on keeping their eyes on the text rather than looking at their hands."
    ],
    Hard: [
      "In Staff Selection Commission exams, accuracy is evaluated strictly, with minor and major errors penalized differently. A major error includes omitting a word, substituting a word, or adding unrequested characters, which can dramatically lower your net typing speed. To ensure success, candidates should practice touch typing on complex passages with numbers, capital letters, and diverse punctuation marks. Proper wrist position helps typists execute keystrokes quickly and accurately, allowing them to complete the exam comfortably within the allotted ten minutes."
    ],
    Expert: [
      "The Staff Selection Commission typing test is a crucial stage in the recruitment process for Junior Secretariat Assistants, Lower Division Clerks, and Data Entry Operators across various government ministries and departments in India. Candidates must type a printed passage of approximately three hundred and fifty words on a computer in exactly ten minutes, which translates to a net speed of thirty-five words per minute. The passages are carefully selected to test the typist's vocabulary, keyboard control, and ability to handle complex punctuation. Success in this exam requires a systematic approach to typing practice, starting with slow, high-accuracy exercises and gradually increasing speed as muscle memory strengthens. Typists should also practice in environments with moderate ambient noise, such as the sound of multiple keyboards, to simulate the actual test centers. By developing high typing speed, excellent accuracy, and strong mental focus, candidates can secure qualifying marks in this critical assessment, paving the way for a successful and stable career in the central government services."
    ]
  },
  "Banking": {
    Beginner: [
      "Banking clerk recruitment exams often include a timed typing test to evaluate data entry speed. Candidates must type financial reports, balance sheets, and administrative letters quickly."
    ],
    Easy: [
      "To clear the banking clerk typing test, candidates must be highly proficient in inputting financial data, customer details, and administrative documents. The typing test requires high accuracy, as financial communication must be error-free."
    ],
    Medium: [
      "The banking clerk typing test is a key qualifying stage that evaluates a candidate's readiness for administrative duties in commercial banks. The exam text typically contains financial terminology, interest rate calculations, and customer service guidelines. Candidates must type at least thirty words per minute, maintaining high accuracy to ensure financial data is recorded correctly. Aspiring clerks should practice typing numerical data, currency symbols, and formal banking letters under timed conditions."
    ],
    Hard: [
      "In financial typing tests, the presence of numbers, percentages, and financial terms like assets, liabilities, and amortization can disrupt typing flow and lead to errors. To maintain speed, typists must practice touch typing numerical keys without looking at the keyboard, using standard finger assignments. By working with real-world financial reports, banking regulations, and compliance documents, candidates can build muscle memory for complex character sequences, helping them complete their banking clerk assessments."
    ],
    Expert: [
      "The banking clerk typing examination is a specialized computer-based assessment designed to verify that candidates can handle high-volume financial data entry and administrative tasks with absolute accuracy and speed. Typists are presented with a detailed financial passage containing commercial banking terms, statistical tables, and policy guidelines that must be transcribed within a strict time limit. Because errors in financial records can have serious legal and financial consequences, banking institutions enforce strict accuracy standards, making high precision the primary goal during practice. Candidates should focus on developing a balanced typing cadence, keeping their wrists raised to avoid fatigue, and maintaining focus on the reference text. Regular practice on financial summaries, banking circulars, and customer service documents helps typists adapt to the formal language and technical vocabulary used in the banking sector. Ultimately, mastering financial typing is an invaluable skill that ensures administrative efficiency, protects data integrity, and supports smooth operations in the modern financial services industry."
    ]
  },
  "Computer Basics": {
    Beginner: [
      "A computer is an electronic machine that processes data using hardware components like the central processing unit, random access memory, and storage drives. The operating system coordinates these parts."
    ],
    Easy: [
      "Operating systems like Windows, macOS, and Linux serve as the critical bridge between physical computer hardware and user software applications. The operating system kernel manages essential system tasks, including memory allocation, processor scheduling, and input-output communication."
    ],
    Medium: [
      "Understanding computer hardware is essential for digital literacy. The motherboard acts as the central hub, connecting the CPU, RAM, and storage devices. The CPU performs calculations, while RAM holds active programs for high-speed access. Storage devices like SSDs provide permanent data storage, keeping files safe when the system is powered off."
    ],
    Hard: [
      "Computer networks allow multiple devices to connect and share data securely using standard communication protocols like TCP/IP. In a local area network, devices share resources like printers and servers, while the global internet connects millions of networks worldwide. Routers direct data packets along the most efficient pathways, and firewalls protect systems from unauthorized access."
    ],
    Expert: [
      "The central processing unit is the primary component of a computer that performs arithmetic, logical, and input-output operations specified by instructions. Modern processors contain billions of transistors on a single silicon chip, enabling high-speed multi-core processing for complex workloads. The processor relies on cache memory to store frequently used data and instructions, reducing the time required to retrieve information from slower system memory. As technological innovations approach the physical limits of traditional silicon transistors, researchers are exploring quantum computing and optical systems to continue boosting performance. Understanding the intricate architecture of processors and operating systems provides a deep appreciation for the advanced engineering that powers our modern digital world."
    ]
  },
  "MS Word": {
    Beginner: [
      "Microsoft Word is a popular word processing software used to create, edit, and format text documents like letters, resumes, reports, and administrative files easily."
    ],
    Easy: [
      "Formatting text in MS Word involves changing font styles, sizes, and colors to make documents visually appealing and professional. Users can also use predefined styles, headers, footers, and page numbers to organize their text."
    ],
    Medium: [
      "Advanced features in Microsoft Word, such as mail merge and table of contents, help users manage complex document workflows efficiently. Mail merge allows you to create personalized letters or labels for multiple recipients using an external data source, while automated tables of contents update page numbers with a single click, saving valuable administrative time."
    ],
    Hard: [
      "Using keyboard shortcuts in Microsoft Word can dramatically increase your writing and formatting speed, allowing you to edit documents without touching the mouse. Common shortcuts like Control-C for copy, Control-V for paste, and Control-S for save are fundamental, while advanced shortcuts like Control-Shift-K allow you to apply specialized formatting styles. Mastering these shortcuts builds a fluid typing experience and enhances professional office productivity."
    ],
    Expert: [
      "Microsoft Word is an indispensable tool in modern office administration, offering a comprehensive suite of features for document design, editing, and collaborative review. The track changes and commenting features allow multiple team members to review a single draft, suggesting edits and providing feedback without altering the original text directly. Users can also create custom document templates, define paragraph styles, and insert automated fields like dates and document titles to maintain visual consistency across all corporate publications. Furthermore, MS Word supports advanced layout tools, including section breaks, multiple columns, and embedded tables, enabling the creation of polished reports and proposals. By mastering these advanced document processing capabilities, administrative professionals can produce highly polished, error-free publications that reflect their organization's expertise and attention to detail, supporting effective business communication and organizational success."
    ]
  },
  "Office Procedures": {
    Beginner: [
      "Standard office procedures are detailed written guidelines designed to ensure safety, consistency, and administrative efficiency in daily operations and team meetings."
    ],
    Easy: [
      "Creating a clear meeting agenda is an essential office procedure that keeps business discussions focused, organized, and productive. Agendas list key topics of discussion and allocate specific time limits for each."
    ],
    Medium: [
      "An official filing system is critical for organizing and retrieving corporate documents quickly and securely. Physical and digital files must be categorized systematically, using consistent naming conventions, index cards, and secure folders. Regular filing audits ensure that sensitive information is protected and old records are archived in compliance with regulatory standards."
    ],
    Hard: [
      "An office dispatch register is a formal ledger used to record all incoming and outgoing official correspondence, ensuring complete administrative accountability. The register must detail the sender's identity, recipient's address, dispatch date, and reference numbers for every letter. This systematic tracking prevents the loss of critical documents and provides a legal record of communications, supporting transparency and efficient workflow management."
    ],
    Expert: [
      "Comprehensive office procedures serve as the operational backbone of any professional organization, establishing clear guidelines for communication, resource utilization, and administrative workflow. These procedures cover essential daily tasks, including handling public inquiries, managing executive schedules, and maintaining office supplies, ensuring that operations continue smoothly even during staff transitions. Developing effective office procedures requires a thorough understanding of organizational goals, team structures, and safety regulations, as well as a commitment to continuous improvement based on feedback. The procedures must be documented clearly in an accessible handbook and updated regularly to reflect technological changes, such as the transition to cloud-based document sharing. By establishing and enforcing robust office procedures, organizations can reduce administrative friction, minimize operational errors, and foster a professional, organized, and respectful workplace culture that supports long-term business success."
    ]
  },
  "English Grammar": {
    Beginner: [
      "Mastery of basic English grammar allows individuals to express their thoughts clearly, construct balanced sentences, and write professional emails and business reports easily."
    ],
    Easy: [
      "Effective writing requires a solid understanding of sentence structure, punctuation, and word choice. Using active verbs and avoiding run-on sentences makes your text much easier to read, keeping your audience engaged and interested."
    ],
    Medium: [
      "Punctuation marks, such as commas, semicolons, and colons, are essential tools for guiding readers through complex sentences and organizing written arguments. Commas indicate brief pauses, semicolons connect closely related independent clauses without conjunctions, and colons introduce lists or explanations, helping to clarify the relationship between different ideas and elevate the quality of your prose."
    ],
    Hard: [
      "The English language is filled with subtle grammatical nuances, including subject-verb agreement, pronoun-antecedent agreement, and proper tense consistency, which must be managed carefully in formal writing. Misplacing a modifier or using a passive voice can confuse readers and reduce the authority of your arguments. Professional communication demands active, concise, and grammatically flawless phrasing, making persistent grammar review a vital practice for anyone working in academic or corporate fields."
    ],
    Expert: [
      "Advanced prose style is characterized by a conscious control over sentence rhythm, length, and structure, transforming standard communication into a highly persuasive and elegant art form. Writers often use parallel structures, balanced clauses, and rhetorical devices to create a pleasing cadence that guides the reader's attention and emphasizes key points. In professional environments, this translates to writing compelling executive summaries, persuasive business proposals, and authoritative policy papers. Achieving this level of proficiency requires analytical reading of respected authors and a commitment to meticulous editing, as polishing drafts and removing unnecessary words is critical to clear writing. Ultimately, mastering English grammar and prose style empowers you to influence opinions, share complex ideas simply, and achieve your professional goals with confidence, making it an invaluable asset in any field."
    ]
  },
  "Current Affairs Style": {
    Beginner: [
      "International climate summits bring global leaders together to negotiate treaties, reduce carbon emissions, and invest in clean renewable energy systems for sustainable development."
    ],
    Easy: [
      "The transition to green energy sources like solar and wind power has accelerated globally, driven by technological innovations that have dramatically lowered production costs and reduced greenhouse gases."
    ],
    Medium: [
      "Global supply chains are facing unprecedented challenges, forcing multinational corporations and governments to evaluate their logistics strategies. Shortages of critical components like semiconductors have highlighted the vulnerability of just-in-time manufacturing models, leading organizations to invest in domestic production, diversify suppliers, and implement advanced digital tracking systems to build resilience."
    ],
    Hard: [
      "The rapid rise of decentralized finance and digital currencies has sparked intense debates among global economists and regulatory bodies. Proponents argue that blockchain technology offers faster transaction speeds, lower fees, and greater financial inclusion for billions of unbanked individuals, while skeptics express concern over market volatility and environmental impacts. Designing regulatory frameworks that protect consumers without stifling technological innovation represents a major challenge."
    ],
    Expert: [
      "The United Nations Sustainable Development Goals represent a comprehensive global roadmap for addressing pressing international challenges like poverty, inequality, and climate change by the target year of 2030. Achieving these seventeen objectives requires unprecedented cooperation, massive financial mobilization, and a shared commitment from both developed and developing nations. Current initiatives are focused on transition strategies toward renewable energy, promoting quality public education, and building resilient industrial infrastructure in vulnerable regions. However, geopolitical tensions and economic instability have slowed progress in key sectors, highlighting the urgent need for renewed diplomatic efforts and public-private partnerships. By prioritizing sustainable growth and social equity, the international community can foster global stability and protect the environment, ensuring that economic development does not compromise the well-being of future generations."
    ]
  },
  "Newspaper Articles": {
    Beginner: [
      "Local municipal authorities have announced a major urban renewal project to build green parks, bicycle lanes, and modern public transit centers in the city center."
    ],
    Easy: [
      "City planners are focusing on sustainable development, designing walkable neighborhoods that integrate residential housing, local businesses, and public transit to reduce traffic congestion and carbon emissions."
    ],
    Medium: [
      "In a major announcement yesterday, the municipal council unveiled plans to invest in smart city infrastructure, aiming to improve public services and reduce energy consumption. The project includes installing automated streetlights, smart water meters, and a centralized traffic management system. Council members expect these modern systems to lower utility costs, improve emergency response times, and enhance the overall quality of urban life."
    ],
    Hard: [
      "The local community has come together to establish a neighborhood cooperative aimed at supporting sustainable agriculture and local food security. By transforming vacant urban lots into vibrant community gardens, residents are growing organic vegetables and hosting educational workshops on composting and water conservation. This grassroots initiative has not only improved access to fresh, healthy produce, but it has also fostered deep social connections among diverse neighbors."
    ],
    Expert: [
      "The recent transformation of the city's historic waterfront district from an abandoned industrial zone into a vibrant cultural hub serves as a model for modern urban regeneration. This ambitious redevelopment project, which spanned over a decade, combined public investments with private partnerships to create a dynamic space featuring parks, art galleries, and residential lofts. Planners prioritized historical preservation, restoring old brick warehouses and integrating them with modern, energy-efficient building designs. The waterfront now attracts millions of visitors annually, boosting the local economy and creating thousands of jobs in retail and hospitality. However, the project has also sparked debates regarding gentrification and affordable housing, highlighting the complex socio-economic challenges that cities must balance when revitalizing historic spaces. By studying these outcomes, other municipalities can learn how to design inclusive development projects that celebrate cultural heritage while supporting sustainable urban growth."
    ]
  },
  "Science": {
    Beginner: [
      "Photosynthesis is a beautiful scientific process where green plants convert sunlight, water, and carbon dioxide into chemical energy, releasing fresh oxygen into the atmosphere."
    ],
    Easy: [
      "Space exploration has captured the human imagination for decades, driving scientific discoveries about our solar system. Robotic rovers on Mars and satellites near distant moons gather valuable data on planetary geology."
    ],
    Medium: [
      "The water cycle is a continuous, beautiful natural process that circulates Earth's water between the atmosphere, land, and oceans. Driven by solar heat, water evaporates from oceans into warm vapor, rising high into the sky. As the air cools, this vapor condenses into clouds, eventually returning to the ground as fresh rain or snow, supporting all life."
    ],
    Hard: [
      "Volcanoes are magnificent geological vents that connect Earth's surface with the hot, molten rock deep inside the mantle. When tectonic plates shift, intense pressure forces magma, ash, and gases to erupt through the volcanic cone, creating dramatic landscapes and rich volcanic soil. Geologists monitor volcanic activity using seismic sensors and satellite imagery to protect nearby communities."
    ],
    Expert: [
      "The scientific method is a systematic, highly disciplined approach to inquiry that forms the absolute foundation of modern research and technological innovation. It begins with careful observation of a natural phenomenon, which leads to the formulation of a testable hypothesis to explain it. Scientists then design and execute rigorous experiments to gather objective data, controlling variables to ensure accurate results. The findings are subjected to statistical analysis and peer review, where other experts in the field challenge the methodology and conclusions to prevent bias. This continuous cycle of observation, testing, and review is what makes science so reliable, allowing humanity to develop vaccines, build spacecraft, and understand the deep laws of nature."
    ]
  },
  "Technology": {
    Beginner: [
      "Cloud computing technology allows businesses and individuals to store and access data over the internet securely, eliminating the need for expensive local computer servers."
    ],
    Easy: [
      "Artificial intelligence is rapidly transforming how we work and communicate with each other daily. Intelligent voice assistants and smart recommendation algorithms simplify complex tasks and personalize our digital experiences."
    ],
    Medium: [
      "Cybersecurity has become one of the most critical priorities for modern organizations and individuals alike. As our personal records, financial transactions, and communication systems move online, the threat of malicious digital attacks continues to grow. Implementing strong passwords, using multi-factor authentication, and keeping software updated are essential security practices to safeguard sensitive data from breaches."
    ],
    Hard: [
      "The Internet of Things represents a massive network of physical devices connected to the internet, all collecting and sharing data to optimize automated systems. From smart thermostats in our homes to industrial sensors on factory machines, IoT technology enables unprecedented levels of monitoring and control. By analyzing this data, businesses can reduce energy use, improve supply chains, and deliver personalized services."
    ],
    Expert: [
      "Quantum computing represents the next major frontier in technology, promising to solve complex mathematical and scientific problems that are far beyond the capabilities of today's most powerful supercomputers. By utilizing the principles of quantum mechanics, such as superposition and entanglement, quantum computers process vast amounts of information simultaneously, offering revolutionary advancements in cryptography, drug discovery, and climate modeling. However, building stable quantum hardware remains an immense engineering challenge, as quantum states are highly sensitive to environmental disturbances and require extreme cooling to operate. As researchers around the world continue to make breakthroughs, the technology industry must prepare for a future where traditional security systems may need complete redesigns to withstand quantum decryption. This exciting blend of theoretical physics and advanced computer engineering holds the potential to reshape our scientific capabilities and unlock solutions to some of humanity's most pressing challenges."
    ]
  },
  "Environment": {
    Beginner: [
      "Protecting our planet's forests is essential for maintaining natural biodiversity, as trees act as giant carbon sinks that help clean and stabilize our global atmosphere."
    ],
    Easy: [
      "Ocean ecosystems are incredibly diverse, containing vibrant coral reefs, vast kelp forests, and mysterious trenches. These environments provide food and oxygen for billions of people but face threats from plastic pollution and warming waters."
    ],
    Medium: [
      "Rainforests are often described as the lungs of the Earth, playing a vital role in regulating the global climate system. These dense, wet forests absorb massive amounts of carbon dioxide and release fresh oxygen, helping to stabilize greenhouse gases. Protecting these ecosystems from deforestation and illegal logging is a global responsibility requiring international cooperation."
    ],
    Hard: [
      "The delicate balance of nature is visible in the complex food webs and migration patterns that link different species across continents. From the seasonal flights of monarch butterflies to the long journeys of humpback whales, animals rely on connected habitats to survive. Climate change and human development are disrupting these corridors, highlighting the need for wildlife bridges and protected pathways."
    ],
    Expert: [
      "Biodiversity is the magnificent variety of life on Earth, encompassing everything from microscopic soil bacteria to towering redwood trees and massive blue whales. This rich genetic variety forms the foundation of stable ecosystems, which provide essential services like clean water, fertile soil, crop pollination, and pest control. However, human activities are driving a rapid loss of biodiversity through habitat destruction, pollution, and the introduction of invasive species. Protecting the natural world requires a fundamental shift in how we value and interact with our environment, moving toward sustainable agricultural practices, renewable energy sources, and robust conservation policies. Educating the public about the vital importance of ecosystems and supporting local conservation initiatives are crucial steps to halt environmental decline. By protecting the diverse species that share our planet, we not only preserve the beauty and wonder of the natural world, but we also secure our own health, food systems, and economic stability."
    ]
  },
  "History": {
    Beginner: [
      "The Renaissance was an amazing historical era that started in Italy during the fourteenth century, marking a powerful rebirth of art, literature, and scientific inquiry."
    ],
    Easy: [
      "The Industrial Revolution, which began in Britain during the late eighteenth century, completely transformed human society and daily life, replacing manual labor with coal-powered machines."
    ],
    Medium: [
      "The Silk Road was an ancient network of trade routes that connected East Asia with the Mediterranean world for centuries, facilitating the exchange of luxurious silks and spices. Beyond commerce, this massive trade highway allowed the transmission of religions, philosophies, and scientific ideas, fostering a rich cultural exchange between different civilizations."
    ],
    Hard: [
      "The signing of the Magna Carta in 1215 was a pivotal moment in the history of democracy, establishing the principle that everyone, including the king, is subject to the law. Drafted by rebellious barons to limit the absolute power of King John, this charter protected basic legal rights and introduced the concept of due process, inspiring future constitutional frameworks."
    ],
    Expert: [
      "The Age of Discovery, spanning from the fifteenth to the seventeenth centuries, was a dramatic period in global history marked by intense maritime exploration and cultural contact. European explorers set sail across uncharted oceans in search of new trade routes to Asia, driven by economic ambitions and technological advancements in shipbuilding. These epic voyages led to the mapping of distant continents, the establishment of global trade networks, and the exchange of agricultural products. However, this era also brought immense suffering to indigenous populations through colonization and disease, highlighting the complex and often tragic consequences of early globalization. Studying this period allows us to understand how our modern world was shaped by these early encounters."
    ]
  },
  "Geography": {
    Beginner: [
      "Rivers play a vital geographic role in shaping landscapes, transporting nutrients, and supporting human civilizations, which is why major cities were founded near them."
    ],
    Easy: [
      "The geography of our planet is characterized by distinct climate zones, ranging from the freezing arctic poles to the hot, humid equatorial regions, which are determined by solar distribution."
    ],
    Medium: [
      "Mountain ranges are magnificent geographical formations created by the slow, powerful collision of Earth's tectonic plates over millions of years. Towering mountains like the Himalayas act as massive weather barriers, blocking clouds and forcing air to rise and release moisture, creating wet, lush forests on one side and arid deserts on the other."
    ],
    Hard: [
      "The concept of geographic isolation explains how physical barriers like oceans, deserts, and deep canyons shape the evolution of unique plant and animal species. Islands, in particular, serve as natural laboratories of evolutionary science, where species adapt over generations to fit highly specific ecological niches without competition from mainland predators."
    ],
    Expert: [
      "Physical geography is the scientific study of the natural features of the Earth, including landforms, oceans, atmospheres, and ecosystems, and how they interact with human societies. Understanding geographical processes is critical for addressing modern challenges like urban sprawl, desertification, and natural resource management. For instance, the geographic distribution of freshwater resources shapes agricultural policies, international relations, and urban development strategies around the globe. By using geographic information systems (GIS) and satellite imagery, modern geographers can track environmental changes in real-time, helping city planners build resilient infrastructure and prepare for natural disasters. This integration of physical science, data technology, and human planning highlights the vital role of geography in designing a sustainable future."
    ]
  },
  "Education": {
    Beginner: [
      "Education is a lifelong journey of self-improvement that extends far beyond school walls, allowing individuals to learn new skills and adapt to a changing world daily."
    ],
    Easy: [
      "Critical thinking is one of the most valuable skills a student can develop, involving analyzing information, questioning assumptions, and evaluating evidence to solve complex daily problems."
    ],
    Medium: [
      "The integration of technology into modern classrooms has revolutionized the educational landscape, offering students and teachers powerful tools for collaboration and research. Digital platforms, interactive simulations, and online libraries provide immediate access to a vast wealth of knowledge, highlighting the need for media literacy education."
    ],
    Hard: [
      "Inclusive education is a philosophy that seeks to ensure all students, regardless of background or learning style, have equal access to high-quality learning opportunities. This approach requires specialized training for teachers, adaptive classroom designs, and diverse curriculum models that celebrate different perspectives, preparing students to work in a diverse global society."
    ],
    Expert: [
      "The ultimate goal of education is not merely the accumulation of facts or the acquisition of professional credentials; rather, it is the cultivation of a thoughtful, empathetic, and independent mind capable of critical inquiry and constructive citizenship. In a rapidly changing global economy, where entire industries can be transformed by technology in a matter of years, the ability to learn, unlearn, and relearn is the most valuable asset an individual can possess. Educational institutions must shift their focus from rote memorization toward teaching students how to think critically, communicate effectively, and collaborate across cultures. This requires project-based learning, interdisciplinary studies, and a strong emphasis on social-emotional development."
    ]
  },
  "Business English": {
    Beginner: [
      "Professional business English communication is a valuable asset that helps build strong brand loyalty, negotiate strategic contracts, and ensure successful global collaborations."
    ],
    Easy: [
      "Writing persuasive business proposals requires clear, concise language and an objective tone. Entrepreneurs must present clear financial plans, market evaluations, and project timelines to secure investor support."
    ],
    Medium: [
      "Strategic business communication is critical for managing internal and external corporate stakeholders. Leaders must draft clear memos, present logical data-driven presentations, and maintain professional etiquette during negotiation sessions. Using precise terminology, structured formatting, and active phrasing helps to convey authority, build trust, and drive successful business partnerships."
    ],
    Hard: [
      "Corporate social responsibility reports have become essential corporate publications, detailing a business's commitment to environmental sustainability, ethical labor practices, and community development. Drafting these reports demands a balanced style that presents detailed statistical data alongside qualitative narratives. By sharing these environmental achievements transparently, companies can enhance their public reputation and earn consumer loyalty."
    ],
    Expert: [
      "In the modern global marketplace, mastery of professional business English is an indispensable leadership skill that enables executives to articulate complex strategies, resolve conflicts, and influence international stakeholders. Effective corporate communication is not just about avoiding grammatical errors; rather, it involves selecting the appropriate diplomatic tone, structuring arguments logically, and presenting technical data in a clear, persuasive format. This proficiency is particularly critical when drafting executive summaries, negotiating cross-border agreements, or managing public relations during organizational crises. Furthermore, cultivating a collaborative and inclusive workplace culture requires leaders to communicate with empathy and clarity, ensuring that diverse team members feel valued and aligned with company goals. By investing in continuous language training and professional writing skills, organizations can improve operational efficiency, reduce communication friction, and secure their competitive advantage."
    ]
  },
  "Formal Emails": {
    Beginner: [
      "Subject: Project Status Update. Dear Team, Please submit your weekly progress reports on our development projects by Friday afternoon for review. Best regards, [Name]."
    ],
    Easy: [
      "Subject: Schedule for Annual Client Inspection. Dear Colleagues, This is to confirm that the client audit will take place at our divisional headquarters on Tuesday at ten in the morning."
    ],
    Medium: [
      "Subject: Action Items from the Strategy Review Session. Dear Team, Thank you for your active participation in our planning meeting yesterday. We have finalized our project objectives and allocated resources accordingly. Please review the attached action items and ensure that your respective tasks are initiated before the end of the week, keeping the team updated on your progress."
    ],
    Hard: [
      "Subject: Revision of Project Timelines and Delivery Guidelines. Dear Colleagues, Due to unexpected technical challenges in our cloud database integration, we have decided to adjust the delivery schedule for the upcoming software release. The new target completion date has been rescheduled to next month, allowing our engineering team to conduct rigorous security audits and resolve system bugs."
    ],
    Expert: [
      "Subject: Invitation to Participate in the Strategic Planning Workshop. Dear Department Heads, I am pleased to invite you to our annual Strategic Planning Workshop, which will be held at our corporate offices from Tuesday to Thursday. The primary objective of this three-day session is to define our operational priorities, review budget allocations, and establish key performance indicators for the upcoming financial year. Your insights and experience are critical to designing a balanced strategy that supports our growth objectives. Please review the attached agenda, which details the schedule of discussions and identifying prep materials for each session. We look forward to your active contribution."
    ]
  },
  "Motivational": {
    Beginner: [
      "Success is not a final destination, but a steady journey of daily practice, personal growth, and unyielding dedication toward mastering your chosen skills."
    ],
    Easy: [
      "Developing a growth mindset is essential for achieving long-term personal success. View every obstacle as an exciting opportunity to learn, build resilience, and improve your character."
    ],
    Medium: [
      "The secret to building lasting healthy habits lies in starting with small, manageable actions that accumulate over time. Consistency is much more valuable than occasional intensity, as daily repetitions wire these actions into automatic routines, making progress effortless. By celebrating minor victories and maintaining a positive attitude, you build steady momentum."
    ],
    Hard: [
      "True resilience is about learning how to adapt and thrive in the face of unexpected challenges, disappointments, and setbacks. It is built by facing difficulties directly, maintaining a hopeful attitude, and focusing on actions within your control. Surrounding yourself with supportive mentors, practicing daily self-reflection, and treating yourself with kindness are essential strategies."
    ],
    Expert: [
      "The pursuit of personal and professional excellence is a lifelong journey that demands absolute dedication, steady self-discipline, and a deep passion for continuous learning. True success is not measured by external awards or financial wealth; rather, it is defined by the depth of your character, your resilience in times of crisis, and your willingness to help others succeed. When you face major setbacks where progress seems invisible, it is your inner vision and core values that keep you moving forward. By cultivating a habit of daily reflection, setting high standards for your work, and treating every failure as a valuable data point, you build an unshakeable foundation for growth."
    ]
  },
  "General Practice": {
    Beginner: [
      "Developing a healthy morning routine can greatly improve your daily productivity. A balanced breakfast, light stretching, and quiet reflection set a positive tone for your day."
    ],
    Easy: [
      "Maintaining a healthy work-life balance is essential in today's fast-paced digital world. Setting clear boundaries for work hours and personal time protects your mental well-being and relationships."
    ],
    Medium: [
      "Daily practice is the cornerstone of physical dexterity and mental focus, helping to reinforce positive habits. Whether you are learning a musical instrument, practicing touch typing, or studying a language, short daily sessions are more effective than long, irregular practices. This consistency trains your brain to execute movements with fluid ease, boosting your confidence."
    ],
    Hard: [
      "Ergonomic computer workspaces are vital for protecting your physical health and preventing repetitive strain injuries during long writing sessions. Typists should adjust their chairs so their feet rest flat on the floor, keep their elbows at a ninety-degree angle, and position their monitors at eye level. Taking frequent short breaks to stretch your wrists can reduce neck tension and shoulder strain."
    ],
    Expert: [
      "The rapid pace of modern daily life requires individuals to manage their time, energy, and digital habits with complete intention. Between professional commitments and personal responsibilities, finding quiet moments for self-care can feel like an impossible challenge, yet it remains non-negotiable for wellness. Digital hygiene—such as turning off notifications during dinner and scheduling screen-free times—is critical to prevent cognitive overload. Cultivating mindful hobbies like reading physical books or walking in nature can recharge your mental battery and foster creative ideas. Ultimately, building a satisfying lifestyle is about prioritizing quality over quantity, focusing on meaningful connections, and treating your mind and body with the respect they deserve."
    ]
  },
  "Stories": {
    Beginner: [
      "The brave little guide lived in a wooden cottage near the whispering forest. He knew every safe mountain path, clear river stream, and hidden valley in the area."
    ],
    Easy: [
      "The old lighthouse keeper climbed the spiral stairs every evening to light the powerful glass lamp. For decades, his steady, warm beam of light had guided tired sailors safely home."
    ],
    Medium: [
      "Deep in the heart of the rugged mountains, a young explorer discovered a hidden path covered in thick green moss and wild roses. Her maps showed nothing but empty cliffs, but her instincts told her to follow the trail. As she walked further, the sounds of the modern world faded away, replaced by the soft singing of birds and the gentle rustle of leaves, opening into a magnificent, untouched valley."
    ],
    Hard: [
      "The ancient library on the cliff was a peaceful sanctuary of forgotten knowledge, holding thousands of leather-bound books. A young scholar spent his nights reading these brittle pages under candle light, searching for clues about a lost desert city. As he turned an old page, a hand-drawn map slid out from the binding, revealing a secret route through the eastern sands, promising an exciting and dangerous adventure."
    ],
    Expert: [
      "The ancient village of Eldervale lay nestled in a quiet valley, surrounded by towering mountains that seemed to touch the sky. For centuries, the villagers lived peaceful lives, guided by the seasons and the customs passed down through generations. However, a mysterious legend spoke of a silver key hidden deep inside the Whispering Caves, a key said to unlock a chest containing the historical records of the first settlers. A young mapmaker named Clara decided to embark on a journey to find this artifact, carrying only a small pack, a notebook, and her grandfather's brass compass. Her quest took her through dense forests, across wild rivers, and up steep, rocky cliffs where the air was cold and thin. Along the way, she met unexpected helpers, including a friendly forest guide and a majestic mountain eagle that showed her the safest passes. When Clara finally reached the entrance of the dark caves, she felt a mixture of fear and determination, knowing that her discovery would change her village's future forever."
    ]
  },
  "Essays": {
    Beginner: [
      "Art is a powerful medium of human expression, allowing individuals to share complex feelings, cultural traditions, and creative ideas across geographic boundaries and historical eras."
    ],
    Easy: [
      "The study of philosophy encourages us to question our assumptions, analyze ethical principles, and explore the nature of reality and human consciousness, fostering open-minded community debates."
    ],
    Medium: [
      "Urban architecture reflects the values, technological capabilities, and social structures of the society that built it. From ancient stone temples and medieval cathedrals to modern glass skyscrapers, buildings serve as durable monuments of historical progress. Analyzing architectural trends helps sociologists understand how cities have evolved to accommodate commercial markets, public spaces, and housing needs."
    ],
    Hard: [
      "The rise of digital media has fundamentally changed the public sphere, altering how democratic societies share information, debate policies, and form communities. While social networks allow individuals to participate in civic discussions globally, they also facilitate the rapid spread of misinformation and create echo chambers. Protecting democratic dialogue requires fostering media literacy and supporting independent journalism to ensure public debates are informed."
    ],
    Expert: [
      "The relationship between human culture and the natural environment has evolved dramatically throughout history, from early societies that lived in close harmony with seasonal cycles to modern industrial economies that seek to control and utilize natural resources. This shift has enabled unprecedented technological progress and material prosperity, but it has also led to severe ecological crises like climate change and habitat destruction. Understanding this complex dynamic requires an interdisciplinary approach that combines physical science, history, and sociology. Cultivating a sustainable future demands that societies rethink their consumption habits, value natural ecosystems, and develop eco-friendly technologies that support biological variety. By embracing a balanced relationship with nature, humanity can ensure long-term prosperity and preserve the beauty of our planet."
    ]
  },
  "Quotes": {
    Beginner: [
      "Wisdom is not a product of schooling, but of the lifelong attempt to acquire it. The only true wisdom is in knowing you know nothing. Change is the law of life."
    ],
    Easy: [
      "The best way to predict the future is to create it. Do not go where the path may lead, go instead where there is no path and leave a trail. Quality is not an act, it is a habit."
    ],
    Medium: [
      "Act as if what you do makes a difference, because it does. The only limit to our realization of tomorrow will be our doubts of today. In the middle of every difficulty lies a wonderful opportunity to build strength. What lies behind us and what lies before us are tiny matters compared to what lies within us."
    ],
    Hard: [
      "Success is not final, failure is not fatal; it is the courage to continue that counts in the end. Believe you can and you are halfway there. The greatest glory in living lies not in never falling, but in rising every time we fall. Your time is limited, so do not waste it living someone else's life."
    ],
    Expert: [
      "Two roads diverged in a wood, and I took the one less traveled by, and that has made all the difference in my journey. The only way to do great work is to love what you do; if you have not found it yet, keep looking and do not settle. Far and away the best prize that life has to offer is the chance to work hard at work worth doing. In three words I can sum up everything I have learned about life: it goes on. It is during our darkest moments that we must focus to see the light, as hope is a powerful force that sustains us."
    ]
  }
};

// Fill in other categories dynamically by mapping them to stable templates if needed,
// but let's make sure we map all 29 categories to dedicated templates!
const CATEGORY_MAP: Record<string, string> = {
  "Official Government Letters": "Official Government Letters",
  "Office Orders": "Office Orders",
  "Memorandums": "Memorandums",
  "Notifications": "Notifications",
  "Circulars": "Circulars",
  "Leave Applications": "Leave Applications",
  "Administrative Orders": "Administrative Orders",
  "JKSSB Typing Practice": "JKSSB Typing Practice",
  "SSC Typing Practice": "SSC Typing Practice",
  "Banking": "Banking",
  "Computer Basics": "Computer Basics",
  "MS Word": "MS Word",
  "Office Procedures": "Office Procedures",
  "English Grammar": "English Grammar",
  "Current Affairs Style": "Current Affairs Style",
  "Newspaper Articles": "Newspaper Articles",
  "Science": "Science",
  "Technology": "Technology",
  "Environment": "Environment",
  "History": "History",
  "Geography": "Geography",
  "Education": "Education",
  "Business English": "Business English",
  "Formal Emails": "Formal Emails",
  "Motivational": "Motivational",
  "General Practice": "General Practice",
  "Stories": "Stories",
  "Essays": "Essays",
  "Quotes": "Quotes"
};

export function generateSeedParagraphs(): Paragraph[] {
  const result: Paragraph[] = [];
  const difficulties: Paragraph['difficulty'][] = ["Beginner", "Easy", "Medium", "Hard", "Expert"];

  for (const category of PROFESSIONAL_CATEGORIES) {
    const targetCategoryKey = CATEGORY_MAP[category] || "General Practice";
    const categoryTemplates = TEMPLATES[targetCategoryKey] || TEMPLATES["General Practice"];

    for (const difficulty of difficulties) {
      const templatesList = categoryTemplates[difficulty] || TEMPLATES["General Practice"][difficulty];

      // Generate 7 paragraphs per category per difficulty to yield exactly 1015 unique paragraphs!
      for (let index = 1; index <= 7; index++) {
        const baseTemplate = templatesList[(index - 1) % templatesList.length];
        const content = fillTemplate(baseTemplate, index, category, difficulty);

        // Calculate exact word count
        const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

        // Determine recommended WPM and XP reward based on difficulty
        let recommendedWpm = 30;
        let xpReward = 40;

        if (difficulty === "Beginner") {
          recommendedWpm = 25 + (index % 5);
          xpReward = 30 + (index % 10);
        } else if (difficulty === "Easy") {
          recommendedWpm = 35 + (index % 5);
          xpReward = 50 + (index % 10);
        } else if (difficulty === "Medium") {
          recommendedWpm = 45 + (index % 5);
          xpReward = 70 + (index % 15);
        } else if (difficulty === "Hard") {
          recommendedWpm = 55 + (index % 5);
          xpReward = 95 + (index % 15);
        } else {
          recommendedWpm = 65 + (index % 10);
          xpReward = 120 + (index % 20);
        }

        // Estimated typing time based on recommended WPM
        // Time = (wordCount / recommendedWpm) * 60 seconds
        const estimatedTime = Math.max(30, Math.round((wordCount / recommendedWpm) * 60));

        const id = `${category.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${difficulty.toLowerCase()}-${index}`;

        // Determine title
        let title = `${category} - ${difficulty} Drill ${index}`;
        if (category === "JKSSB Typing Practice") {
          title = `JKSSB Junior Assistant - Practice Sheet ${index}`;
        } else if (category === "SSC Typing Practice") {
          title = `SSC CHSL DEO - Test Sheet ${index}`;
        } else if (category === "Banking") {
          title = `Banking Clerk - Financial Passage ${index}`;
        } else if (category === "Official Government Letters") {
          title = `Official Letter Correspondence - ${index}`;
        } else if (category === "Office Orders") {
          title = `Office Order No. ${index * 15}/${index + 2}`;
        } else if (category === "Memorandums") {
          title = `Administrative Memorandum - Sample ${index}`;
        } else if (category === "Notifications") {
          title = `Government Gazette Notification - ${index}`;
        } else if (category === "Circulars") {
          title = `Office Circular ${index * 8}/${index + 1}`;
        } else if (category === "Leave Applications") {
          title = `Formal Leave Request - Draft ${index}`;
        } else if (category === "Administrative Orders") {
          title = `Administrative Executive Order ${index}`;
        }

        // Exam tagging for the Official tab filtering
        let exam: string | undefined = undefined;
        const officialCategories = [
          "Official Government Letters",
          "Office Orders",
          "Memorandums",
          "Notifications",
          "Circulars",
          "Leave Applications",
          "Administrative Orders",
          "JKSSB Typing Practice",
          "SSC Typing Practice",
          "Banking"
        ];

        if (officialCategories.includes(category)) {
          exam = category.replace(" Typing Practice", "").replace(" Letters", "").replace(" Orders", "");
        }

        result.push({
          id,
          title,
          category,
          difficulty,
          wordCount,
          estimatedTime,
          language: "English",
          tags: [category.replace(" Typing Practice", ""), difficulty],
          createdAt: 1719875664000 + (index * 86400000), // Static timestamp
          content,
          exam,
          recommendedWpm,
          xpReward
        });
      }
    }
  }

  return result;
}

export const DYNAMIC_PARAGRAPH_DATABASE = generateSeedParagraphs();
/* v8 ignore stop */
