import { useId, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface Props {
  heroImage?: string;
  confidentialityTitle?: string;
  confidentialityBody?: string;
  generalSubmissionLabel?: string;
  generalSubmissionHref?: string;
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <motion.div {...fade} className="lg:col-span-5">
          {props.heroImage && (
            <img
              src={props.heroImage}
              alt=""
              loading="lazy"
              className="w-full h-auto rounded-sm"
            />
          )}
          {props.confidentialityTitle && (
            <div className="mt-6 p-6 bg-brand-500/5 border-l-4 border-brand-500 rounded-sm">
              <h3 className="text-lg font-heavy text-brand-500 mb-2">
                {props.confidentialityTitle}
              </h3>
              <p className="text-base text-ink/85 leading-relaxed">
                {props.confidentialityBody}
              </p>
            </div>
          )}
          {props.generalSubmissionHref && (
            <a
              href={props.generalSubmissionHref}
              className="mt-4 inline-block text-sm font-medium text-brand-500 hover:text-brand-accent transition-colors duration-150"
            >
              {props.generalSubmissionLabel} →
            </a>
          )}
        </motion.div>

        <motion.form
          {...fade}
          transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.08 }}
          className="lg:col-span-7 bg-surface border border-ink/10 rounded-sm p-6 md:p-10"
          onSubmit={handleSubmit}
          noValidate
        >
          {submitted ? (
            <motion.p
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.35, ease: EASE }}
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
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Field id={`${fid}-subject`} label="Subject *" required />
              <div className="md:col-span-2">
                <label
                  htmlFor={`${fid}-message`}
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
                  Send message <span aria-hidden>→</span>
                </motion.button>
              </div>
            </div>
          )}
        </motion.form>
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
