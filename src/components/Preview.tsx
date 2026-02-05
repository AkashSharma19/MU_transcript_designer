import { useTranscript } from '../context/TranscriptContext';
import { type Term, type ColumnConfig, type SummaryTableConfig } from '../types';

export default function Preview() {
    const { data } = useTranscript();

    // Split data by type
    const inClassTerms = data.courseData.filter(term => term.type !== 'OutClass');
    const outClassTerms = data.courseData.filter(term => term.type === 'OutClass');

    // Helper to render Summary Table
    const renderSummaryTable = (section: SummaryTableConfig, values: any) => (
        section.isVisible && (section.showCreditsRequired || section.showCreditsAwarded || section.showCGPA) && (
            <div key={section.id} className="border border-gray-300 text-[8px] mb-4">
                {section.showCreditsRequired && (
                    <div className="flex border-b last:border-b-0 border-gray-300">
                        <div className="p-1 px-2 font-bold border-r border-gray-300 w-full sm:w-1/2 md:w-3/4 flex justify-between">
                            <span>{section.creditsRequiredLabel}</span>
                        </div>
                        <div className="p-1 px-2 text-right w-full sm:w-1/2 md:w-1/4">
                            {values.creditsRequired}
                        </div>
                    </div>
                )}
                {section.showCreditsAwarded && (
                    <div className="flex border-b last:border-b-0 border-gray-300">
                        <div className="p-1 px-2 font-bold border-r border-gray-300 w-full sm:w-1/2 md:w-3/4 flex justify-between">
                            <span>{section.creditsAwardedLabel}</span>
                        </div>
                        <div className="p-1 px-2 text-right w-full sm:w-1/2 md:w-1/4">
                            {values.creditsAwarded}
                        </div>
                    </div>
                )}
                {section.showCGPA && (
                    <div className="flex border-b last:border-b-0 border-gray-300">
                        <div className="p-1 px-2 font-bold border-r border-gray-300 w-full sm:w-1/2 md:w-3/4 flex justify-between">
                            <span>{section.cgpaLabel}</span>
                        </div>
                        <div className="p-1 px-2 text-right w-full sm:w-1/2 md:w-1/4">
                            {values.cgpa}
                        </div>
                    </div>
                )}
            </div>
        )
    );

    // Render Term-wise Grid (Original Format)
    const renderGridFormat = (terms: Term[], config: ColumnConfig) => {
        return (
            <div className="grid grid-cols-2 gap-x-3 gap-y-3 content-start mb-4">
                {terms.map(term => (
                    <div key={term.id} className="text-[8px] h-full">
                        <div className="border border-gray-300 h-full flex flex-col">
                            {/* Header */}
                            <div className="flex bg-white border-b border-gray-300 font-bold text-black flex-shrink-0">
                                <div className="px-1 py-0.5 border-r border-gray-300 leading-tight flex items-center flex-[3]">
                                    {term.name}
                                </div>
                                {config.showCourseType && (
                                    <div className="px-1 py-0.5 border-r border-gray-300 leading-tight flex items-center justify-center w-14 text-center">
                                        {config.courseTypeLabel}
                                    </div>
                                )}
                                {config.showCredits && (
                                    <div className="px-1 py-0.5 border-r border-gray-300 leading-tight flex items-center justify-center w-10 text-center">
                                        {config.creditsLabel}
                                    </div>
                                )}
                                {config.showGrade && (
                                    <div className="px-1 py-0.5 border-r border-gray-300 leading-tight flex items-center justify-center w-10 text-center">
                                        {config.gradeLabel}
                                    </div>
                                )}
                                {config.showGPA && (
                                    <div className={`px-1 py-0.5 leading-tight flex items-center justify-center w-10 text-center ${config.showPercentage ? 'border-r border-gray-300' : ''}`}>
                                        {config.gpaLabel}
                                    </div>
                                )}
                                {config.showPercentage && (
                                    <div className="px-1 py-0.5 leading-tight flex items-center justify-center w-14 text-center">
                                        {config.percentageLabel}
                                    </div>
                                )}
                            </div>

                            {/* Rows */}
                            {term.courses.map(course => (
                                <div key={course.id} className="flex border-b border-gray-300 flex-1">
                                    <div className="px-1 py-0.5 border-r border-gray-300 flex items-center flex-[3]">
                                        <span className="mr-1">{course.code}</span> {course.name}
                                    </div>
                                    {config.showCourseType && (
                                        <div className="px-1 py-0.5 border-r border-gray-300 flex items-center justify-center w-14 text-center">
                                            {course.courseType || "Core"}
                                        </div>
                                    )}
                                    {config.showCredits && (
                                        <div className="px-1 py-0.5 border-r border-gray-300 flex items-center justify-center w-10 text-center">
                                            {course.credits}
                                        </div>
                                    )}
                                    {config.showGrade && (
                                        <div className="px-1 py-0.5 border-r border-gray-300 flex items-center justify-center w-10 text-center">
                                            {course.grade}
                                        </div>
                                    )}
                                    {config.showGPA && (
                                        <div className={`px-1 py-0.5 flex items-center justify-center w-10 text-center ${config.showPercentage ? 'border-r border-gray-300' : ''}`}>
                                            {course.gpa}
                                        </div>
                                    )}
                                    {config.showPercentage && (
                                        <div className="px-1 py-0.5 flex items-center justify-center w-14 text-center">
                                            {course.percentage}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Render Consolidated List (Single Table Format)
    const renderListFormat = (terms: Term[], config: ColumnConfig, sectionLabel: string) => {
        return (
            <div className="text-[8px] w-full mb-4">
                <div className="border border-gray-300">
                    {/* Header */}
                    <div className="flex bg-white border-b border-gray-300 font-bold text-black">
                        <div className="px-1 py-0.5 border-r border-gray-300 w-16 flex items-center justify-center text-center">
                            Term
                        </div>
                        <div className="px-1 py-0.5 border-r border-gray-300 flex-[3] flex items-center">
                            {sectionLabel}
                        </div>
                        {config.showCourseType && (
                            <div className="px-1 py-0.5 border-r border-gray-300 leading-tight flex items-center justify-center w-14 text-center">
                                {config.courseTypeLabel}
                            </div>
                        )}
                        {config.showCredits && (
                            <div className="px-1 py-0.5 border-r border-gray-300 leading-tight flex items-center justify-center w-10 text-center">
                                {config.creditsLabel}
                            </div>
                        )}
                        {config.showGrade && (
                            <div className="px-1 py-0.5 border-r border-gray-300 leading-tight flex items-center justify-center w-10 text-center">
                                {config.gradeLabel}
                            </div>
                        )}
                        {config.showGPA && (
                            <div className={`px-1 py-0.5 leading-tight flex items-center justify-center w-10 text-center ${config.showPercentage ? 'border-r border-gray-300' : ''}`}>
                                {config.gpaLabel}
                            </div>
                        )}
                        {config.showPercentage && (
                            <div className="px-1 py-0.5 leading-tight flex items-center justify-center w-14 text-center">
                                {config.percentageLabel}
                            </div>
                        )}
                    </div>

                    {/* Flattened Rows */}
                    {terms.map(term => (
                        term.courses.map(course => (
                            <div key={course.id} className="flex border-b border-gray-300 last:border-b-0">
                                <div className="px-1 py-0.5 border-r border-gray-300 w-16 flex items-center justify-center text-center">
                                    {term.name.replace(" (OutClass)", "")}
                                </div>
                                <div className="px-1 py-0.5 border-r border-gray-300 flex-[3] flex items-center">
                                    <span className="mr-1">{course.code}</span> {course.name}
                                </div>
                                {config.showCourseType && (
                                    <div className="px-1 py-0.5 border-r border-gray-300 flex items-center justify-center w-14 text-center">
                                        {course.courseType || "Core"}
                                    </div>
                                )}
                                {config.showCredits && (
                                    <div className="px-1 py-0.5 border-r border-gray-300 flex items-center justify-center w-10 text-center">
                                        {course.credits}
                                    </div>
                                )}
                                {config.showGrade && (
                                    <div className="px-1 py-0.5 border-r border-gray-300 flex items-center justify-center w-10 text-center">
                                        {course.grade}
                                    </div>
                                )}
                                {config.showGPA && (
                                    <div className={`px-1 py-0.5 flex items-center justify-center w-10 text-center ${config.showPercentage ? 'border-r border-gray-300' : ''}`}>
                                        {course.gpa}
                                    </div>
                                )}
                                {config.showPercentage && (
                                    <div className="px-1 py-0.5 flex items-center justify-center w-14 text-center">
                                        {course.percentage}
                                    </div>
                                )}
                            </div>
                        ))
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-[10mm] relative mx-auto" style={{ aspectRatio: '210/297' }}>
            {/* Decorative Borders */}
            <div className="absolute inset-0 pointer-events-none p-2">
                {/* Outer Border (Thin) */}
                <div className="absolute inset-2 border-[1px] border-transparent rounded-sm"
                    style={{
                        background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom right, #0ea5e9, #fbbf24) border-box'
                    }}>
                </div>
                {/* Inner Border (Thick) */}
                <div className="absolute inset-4 border-[4px] border-transparent rounded-sm"
                    style={{
                        background: 'linear-gradient(white, white) padding-box, linear-gradient(to bottom right, #0ea5e9, #fbbf24) border-box'
                    }}>
                </div>
            </div>

            <div className="relative z-10 h-full flex flex-col font-serif">
                {/* Header */}
                <div className="text-center mb-5">
                    {data.header.logo && <img src={data.header.logo} alt="Logo" className="h-8 mx-auto mb-2" />}
                    <h1 className="text-base font-bold uppercase tracking-wide text-black leading-tight">{data.header.instituteName}</h1>
                    <h2 className="text-[10px] font-bold text-black mt-1">{data.header.subHeader}</h2>
                    <h3 className="text-[10px] font-bold text-black mt-1">{data.header.documentTitle}</h3>
                    <p className="text-[9px] font-bold text-black mt-1">{data.header.academicYear}</p>
                </div>

                {/* Student Info */}
                <div className="mb-3 text-[9px] font-bold text-black space-y-0.5">
                    <p>Name: <span>{data.student.name}</span></p>
                    <p>Roll No: <span>{data.student.rollNo}</span></p>
                    <p>Graduation Status: <span>{data.student.status}</span></p>
                </div>

                {/* Unified Table View */}
                {data.isUnifiedTables && (
                    <>
                        {data.tableConfigs.inClass.format === 'grid'
                            ? renderGridFormat([...inClassTerms, ...outClassTerms], data.tableConfigs.inClass)
                            : renderListFormat([...inClassTerms, ...outClassTerms], data.tableConfigs.inClass, 'Combined Terms')
                        }
                        {/* InClass Summary */}
                        {data.summaryConfig.sections.filter(s => s.type === 'InClass').map(section =>
                            renderSummaryTable(section, data.systemValues['InClass'] || {})
                        )}
                        {/* OutClass Summary */}
                        {data.summaryConfig.sections.filter(s => s.type === 'OutClass').map(section =>
                            renderSummaryTable(section, data.systemValues['OutClass'] || {})
                        )}
                    </>
                )}

                {/* Separate Views (Default) */}
                {!data.isUnifiedTables && (
                    <>
                        {/* InClass Section */}
                        {inClassTerms.length > 0 && (
                            <>
                                {data.tableConfigs.inClass.format === 'grid'
                                    ? renderGridFormat(inClassTerms, data.tableConfigs.inClass)
                                    : renderListFormat(inClassTerms, data.tableConfigs.inClass, 'InClass')
                                }
                            </>
                        )}
                        {/* InClass Summary */}
                        {data.summaryConfig.sections.filter(s => s.type === 'InClass').map(section =>
                            renderSummaryTable(section, data.systemValues['InClass'] || {})
                        )}

                        {/* OutClass Section */}
                        {outClassTerms.length > 0 && (
                            <>
                                {data.tableConfigs.outClass.format === 'grid'
                                    ? renderGridFormat(outClassTerms, data.tableConfigs.outClass)
                                    : renderListFormat(outClassTerms, data.tableConfigs.outClass, 'OutClass')
                                }
                            </>
                        )}
                        {/* OutClass Summary */}
                        {data.summaryConfig.sections.filter(s => s.type === 'OutClass').map(section =>
                            renderSummaryTable(section, data.systemValues['OutClass'] || {})
                        )}
                    </>
                )}

                {/* Overall Summary (Always Visible if enabled) */}
                {data.summaryConfig.sections.filter(s => s.type === 'Overall').map(section =>
                    renderSummaryTable(section, data.systemValues['Overall'] || {})
                )}


                {/* Spacer to push footer down */}
                <div className="flex-1"></div>


                {/* Footer */}
                <div className="mt-5 flex justify-between items-end text-[8px]">
                    <div>
                        <p className="mb-3 text-gray-600 italic">{data.footer.footerText}</p>
                        {data.footer.signature && <img src={data.footer.signature} alt="Signature" className="h-10 mb-1" />}
                        {!data.footer.signature && <div className="font-cursive text-xl mb-1 text-gray-800" style={{ fontFamily: 'Kaushan Script, cursive' }}>{data.footer.signatoryName}</div>}

                        <p className="font-bold text-gray-900">{data.footer.signatoryName}</p>
                        <p className="text-gray-600">{data.footer.signatoryDesignation}</p>
                    </div>
                    <div className="text-right text-gray-500">
                        <div className="w-12 h-12 bg-gray-200 ml-auto mb-1"></div>
                        <p>{data.footer.date}</p>
                        <p>{data.footer.location}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
