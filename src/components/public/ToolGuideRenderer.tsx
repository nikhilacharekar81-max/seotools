import React, { useState } from 'react';
import { getToolGuide } from '../../data/toolGuides';
import { 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Cpu, 
  ListOrdered, 
  FileText, 
  Table, 
  ShieldAlert, 
  Wrench, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Lightbulb, 
  Compass, 
  Info,
  BookOpen
} from 'lucide-react';

interface ToolGuideRendererProps {
  slugOrId: string;
  setPublicRoute?: (route: { page: 'home' | 'tool' | 'blog' | 'blog_post' | 'pricing' | 'custom_page'; param?: string }) => void;
}

export const ToolGuideRenderer: React.FC<ToolGuideRendererProps> = ({ slugOrId, setPublicRoute }) => {
  const guide = getToolGuide(slugOrId);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Generate structured FAQ JSON-LD schema for search engines
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': guide.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  return (
    <div className="w-full mt-12 space-y-12 text-slate-800 font-sans border-t border-slate-200/80 pt-10">
      {/* FAQ Schema Script for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. LAYER 1 & 2: Header & Value Proposition Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <BookOpen className="w-72 h-72 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <Info className="w-3.5 h-3.5" />
            <span>Authoritative Guide & Reference</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            {guide.h1}
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {guide.valueProposition}
          </p>
        </div>
      </div>

      {/* 2. LAYER 4: Quick Explanation Callout */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 sm:p-5 flex items-start gap-3 text-blue-950 text-xs sm:text-sm leading-relaxed">
        <Lightbulb className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold text-blue-900 block mb-0.5">Core Purpose:</strong>
          <span>{guide.quickExplanation}</span>
        </div>
      </div>

      {/* 3. LAYER 5: What is this tool? */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{guide.whatIsIt.title}</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed font-normal">
          {guide.whatIsIt.paragraphs.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>
      </section>

      {/* 4. LAYER 6: What does it analyze or generate? */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{guide.whatItAnalyzesOrGenerates.title}</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guide.whatItAnalyzesOrGenerates.items.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{item.name}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              <div className="pt-1 border-t border-slate-200/60 text-[11px] text-emerald-700 font-medium">
                <strong>Impact:</strong> {item.impact}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. LAYER 7: How does it work? (Methodology) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{guide.howItWorksMethodology.title}</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{guide.howItWorksMethodology.description}</p>
        <div className="bg-slate-900 text-slate-200 rounded-xl p-5 font-mono text-xs space-y-2.5 border border-slate-800">
          {guide.howItWorksMethodology.technicalDetails.map((detail, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-purple-400 select-none">›</span>
              <span className="leading-relaxed">{detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. LAYER 8: How to use it (Step-by-Step) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ListOrdered className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">How to Use This Tool Step-by-Step</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {guide.howToSteps.map((step) => (
            <div key={step.stepNumber} className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 relative">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-600 text-white font-mono text-xs font-bold">
                Step {step.stepNumber}
              </span>
              <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. LAYER 9: Example (Input -> Result -> Explanation) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Practical Demonstration Example</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">Input Context</span>
            <p className="text-xs font-mono text-slate-800 bg-white p-3 rounded-lg border border-amber-200/60 leading-relaxed">
              {guide.example.inputContent}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider block">Output Result</span>
            <div className="space-y-1.5 bg-white p-3 rounded-lg border border-emerald-200/60">
              {guide.example.resultMetrics.map((m, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-slate-600">{m.label}:</span>
                  <strong className="font-mono text-emerald-800">{m.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
          <strong>Result Analysis:</strong> {guide.example.explanation}
        </div>
      </section>

      {/* 8. LAYER 10: Understanding Your Results */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{guide.understandingResults.title}</h3>
        </div>
        <div className="space-y-3">
          {guide.understandingResults.keyPoints.map((point, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{point.metricOrOutput}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{point.interpretation}</p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-right shrink-0">
                <span className="block text-[10px] text-slate-400 uppercase font-semibold">Target Benchmark</span>
                <span className="text-xs font-bold text-teal-700">{point.targetBenchmark}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. LAYER 11: Best Practices */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Recommended Best Practices</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guide.bestPractices.map((bp, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wide">
                {bp.badge}
              </span>
              <h4 className="text-xs font-bold text-slate-900">{bp.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{bp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 10. LAYER 12: Common Mistakes */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Common Pitfalls & How to Avoid Them</h3>
        </div>
        <div className="space-y-3">
          {guide.commonMistakes.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-rose-50/40 border border-rose-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <strong className="text-rose-900 block font-bold">Mistake:</strong>
                <span className="text-slate-700">{m.mistake}</span>
              </div>
              <div>
                <strong className="text-rose-900 block font-bold">Negative Impact:</strong>
                <span className="text-slate-700">{m.impact}</span>
              </div>
              <div>
                <strong className="text-emerald-900 block font-bold">Recommended Fix:</strong>
                <span className="text-slate-700">{m.fix}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 11. LAYER 13: Limitations & Disclaimers */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{guide.limitations.title}</h3>
        </div>
        <ul className="space-y-2 text-xs sm:text-sm text-slate-700 list-disc pl-5 leading-relaxed">
          {guide.limitations.points.map((pt, idx) => (
            <li key={idx}>{pt}</li>
          ))}
        </ul>
      </section>

      {/* 12. LAYER 14: Troubleshooting */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
            <Wrench className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Troubleshooting Common Issues</h3>
        </div>
        <div className="space-y-3">
          {guide.troubleshooting.map((t, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Issue: {t.issue}</span>
              </h4>
              <p className="text-slate-600 pl-4"><strong>Probable Cause:</strong> {t.cause}</p>
              <p className="text-emerald-800 font-medium pl-4"><strong>Solution:</strong> {t.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 13. LAYER 15: Comparison Table (Optional) */}
      {guide.comparison && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Table className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">{guide.comparison.title}</h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">{guide.comparison.description}</p>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-bold">
                <tr>
                  {guide.comparison.columns.map((col, idx) => (
                    <th key={idx} className="p-3.5">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {guide.comparison.rows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{r.concept}</td>
                    <td className="p-3.5">{r.col1}</td>
                    <td className="p-3.5">{r.col2}</td>
                    {r.col3 && <td className="p-3.5">{r.col3}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 14. LAYER 16: Advanced Information */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{guide.advancedInfo.title}</h3>
        </div>
        <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
          {guide.advancedInfo.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>
      </section>

      {/* 15. LAYER 17: High-Value FAQ Accordion */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">Frequently Asked Questions</h3>
        </div>
        <div className="space-y-3">
          {guide.faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="rounded-xl border border-slate-200 overflow-hidden transition-colors">
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full px-5 py-4 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-left text-xs sm:text-sm font-bold text-slate-900 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-5 py-4 bg-white border-t border-slate-200 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 16. LAYER 18 & 20: Related Tools & Next Step */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Connected Suite Tools</span>
          <h3 className="text-xl sm:text-2xl font-black text-white">Related Tools & Logical Next Steps</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {guide.relatedTools.map((rt, idx) => (
            <div key={idx} className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-xl space-y-3 flex flex-col justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{rt.name}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{rt.description}</p>
              </div>
              {setPublicRoute && (
                <button
                  type="button"
                  onClick={() => setPublicRoute({ page: 'tool', param: rt.slug })}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-between w-full mt-2"
                >
                  <span>{rt.cta}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Step Action Box */}
        {guide.nextSteps && setPublicRoute && (
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-blue-950/50 p-4 rounded-xl border border-blue-900/60">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Recommended Next Step</span>
              <p className="text-xs sm:text-sm text-slate-200">{guide.nextSteps.text}</p>
            </div>
            <button
              type="button"
              onClick={() => setPublicRoute({ page: 'tool', param: guide.nextSteps.targetSlug })}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-2 shrink-0 self-start sm:self-auto"
            >
              <span>{guide.nextSteps.actionText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
};
