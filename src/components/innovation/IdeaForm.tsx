import { useEffect, useId, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { i18nAttr } from '../../lib/i18n';

interface Props {
  heroImage?: string;
  confidentialityTitle?: string;
  confidentialityBody?: string;
}

const COUNTRIES = [
  'Cyprus',
  'Greece',
  'Germany',
  'United Kingdom',
  'France',
  'Italy',
  'Spain',
  'Netherlands',
  'Austria',
  'Switzerland',
  'Lebanon',
  'Egypt',
  'United Arab Emirates',
  'Saudi Arabia',
  'Other',
];

const CAPTCHA_ANSWER = 5;
const EASE = [0.22, 1, 0.36, 1] as const;

export default function IdeaForm(props: Props) {
  const reduce = useReducedMotion();
  const fid = useId();
  const [captcha, setCaptcha] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const captchaValid = Number(captcha) === CAPTCHA_ANSWER;

  // Re-apply the language swap once this island has rendered its current tree,
  // so it shows Greek on first load when a non-English language is stored.
  useEffect(() => {
    try {
      const l = localStorage.getItem('elysee.lang');
      if (l && l !== 'en') document.dispatchEvent(new CustomEvent('elysee:lang', { detail: { lang: l } }));
    } catch {}
  }, [submitted]);

  const fade = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-80px' },
        transition: { duration: 0.5, ease: EASE },
      };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity() || !captchaValid) {
      form.reportValidity();
      return;
    }
    setSubmitted(true);
  };

  return (
    <section id="idea-form" className="my-10 md:my-14 scroll-mt-28">
      <div className="max-w-screen-md mx-auto space-y-8 md:space-y-10">
        {/* Illustration — sits under the intro copy, enlarged */}
        {props.heroImage && (
          <motion.img
            {...fade}
            src={props.heroImage}
            alt=""
            loading="lazy"
            className="block w-full h-auto rounded-sm"
          />
        )}

        {/* Confidentiality note */}
        {props.confidentialityTitle && (
          <motion.div {...fade} className="p-6 bg-brand-500/5 border-l-4 border-brand-500 rounded-sm">
            <h3 data-i18n={i18nAttr(props.confidentialityTitle ?? '')} className="text-lg font-heavy text-brand-500 mb-2">
              {props.confidentialityTitle}
            </h3>
            <p data-i18n={i18nAttr(props.confidentialityBody ?? '')} className="text-base text-ink/85 leading-relaxed">
              {props.confidentialityBody}
            </p>
          </motion.div>
        )}

        {/* Submission form */}
        <motion.form
          {...fade}
          transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.08 }}
          className="bg-surface border border-ink/10 rounded-sm p-6 md:p-10"
          onSubmit={handleSubmit}
          noValidate
        >
          {submitted ? (
            <motion.p
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
              data-i18n={i18nAttr('Thank you — we will be in touch shortly to discuss your idea confidentially.')}
              className="text-base md:text-lg text-ink"
              role="status"
            >
              Thank you — we will be in touch shortly to discuss your idea confidentially.
            </motion.p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field id={`${fid}-name`} label="Name *" required />
              <Field id={`${fid}-email`} label="Email *" type="email" required />
              <Field id={`${fid}-phone`} label="Phone Number *" type="tel" required />
              <Field id={`${fid}-company`} label="Company *" required />
              <div>
                <label
                  htmlFor={`${fid}-country`}
                  data-i18n={i18nAttr('Country *')}
                  className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2"
                >
                  Country *
                </label>
                <select
                  id={`${fid}-country`}
                  name="country"
                  required
                  defaultValue="Cyprus"
                  className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c} data-i18n={i18nAttr(c)}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Field id={`${fid}-subject`} label="Subject *" required />
              <div className="md:col-span-2">
                <label
                  htmlFor={`${fid}-message`}
                  data-i18n={i18nAttr('Message')}
                  className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2"
                >
                  Message
                </label>
                <textarea
                  id={`${fid}-message`}
                  name="message"
                  rows={5}
                  className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150"
                ></textarea>
              </div>
              <div>
                <label
                  htmlFor={`${fid}-captcha`}
                  data-i18n={i18nAttr('Please solve: 7 − 2 *')}
                  className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2"
                >
                  Please solve: 7 − 2 *
                </label>
                <input
                  id={`${fid}-captcha`}
                  name="captcha"
                  value={captcha}
                  onChange={(e) => setCaptcha(e.target.value)}
                  inputMode="numeric"
                  required
                  aria-invalid={captcha.length > 0 && !captchaValid}
                  className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150"
                />
              </div>
              <div className="md:col-span-2 mt-2">
                <motion.button
                  type="submit"
                  disabled={!captchaValid}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                  whileHover={reduce ? undefined : { y: -2 }}
                  className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-500 text-surface text-sm font-medium uppercase tracking-widest rounded-sm cursor-pointer transition-colors duration-200 hover:bg-brand-accent disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
                >
                  <span data-i18n={i18nAttr('Send message')}>Send message</span> <span aria-hidden>→</span>
                </motion.button>
              </div>
            </div>
          )}
        </motion.form>

        {/* Primary CTA — submit the idea via the SurveyMonkey form */}
        <motion.a
          {...fade}
          href="https://www.surveymonkey.com/r/5LF2YPM"
          target="_blank"
          rel="noopener noreferrer"
          whileTap={reduce ? undefined : { scale: 0.98 }}
          whileHover={reduce ? undefined : { y: -2 }}
          className="flex items-center justify-center gap-3 w-full px-8 py-5 bg-brand-500 text-surface text-base md:text-lg font-heavy uppercase tracking-widest rounded-sm text-center transition-colors duration-200 hover:bg-brand-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <span data-i18n={i18nAttr('Click to submit your idea!')}>Click to submit your idea!</span>
          <span aria-hidden>→</span>
        </motion.a>
      </div>
    </section>
  );
}

function Field({
  id,
  label,
  type = 'text',
  required,
}: {
  id: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        data-i18n={i18nAttr(label)}
        className="block text-xs uppercase tracking-widest font-medium text-ink/70 mb-2"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="w-full px-4 py-3 bg-surface-alt border border-ink/15 rounded-sm text-base text-ink focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 transition-colors duration-150"
      />
    </div>
  );
}
