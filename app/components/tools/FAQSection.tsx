'use client';

import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    faqs: FAQItem[];
    toolName: string;
    pageUrl: string;
}

export default function FAQSection({ faqs, toolName, pageUrl }: FAQSectionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
        url: pageUrl,
        name: `${toolName} — Frequently Asked Questions`,
    };

    return (
        <section aria-labelledby="faq-heading">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
            <h2 id="faq-heading" className="text-xl font-bold text-white mb-6">
                Frequently Asked Questions
            </h2>
            <div className="space-y-2" role="list">
                {faqs.map((faq, i) => (
                    <div
                        key={i}
                        role="listitem"
                        className={`rounded-xl border transition-colors duration-200 overflow-hidden ${openIndex === i
                                ? 'border-indigo-500/30 bg-indigo-500/5'
                                : 'border-white/8 bg-white/3 hover:border-white/15'
                            }`}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            aria-expanded={openIndex === i}
                            aria-controls={`faq-answer-${i}`}
                            id={`faq-question-${i}`}
                            className="w-full flex items-center justify-between px-5 py-4 text-left"
                        >
                            <span className="text-sm font-medium text-slate-200 pr-4">{faq.question}</span>
                            <svg
                                className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180 text-indigo-400' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {openIndex === i && (
                            <div
                                id={`faq-answer-${i}`}
                                role="region"
                                aria-labelledby={`faq-question-${i}`}
                                className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3"
                            >
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
}
