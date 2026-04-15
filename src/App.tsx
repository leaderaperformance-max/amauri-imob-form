import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';
import logoImg from './imgs/A - AMAURI - LOGO COLORIDA - FUNDO CLARO.png';
import amauriPhoto from './imgs/AMAURI FOTO PRINCIPAL COMPLETA.png';

type FormData = {
  name: string;
  email: string;
  phone: string;
  buyingTimeframe: string;
  propertyType: string;
  budget: string;
  downPayment: string;
  income: string;
  location: string;
};

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  buyingTimeframe: '',
  propertyType: '',
  budget: '',
  downPayment: '',
  income: '',
  location: '',
};

// ─── Validation helpers ────────────────────────────────────────────

function validateName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Preencha seu nome completo.';
  if (trimmed.length < 3) return 'O nome precisa ter pelo menos 3 caracteres.';
  if (!/\s/.test(trimmed)) return 'Informe nome e sobrenome.';
  if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(trimmed)) return 'O nome contém caracteres inválidos.';
  return null;
}

function validateEmail(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Preencha seu e-mail.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) return 'Informe um e-mail válido. Ex: nome@email.com';
  return null;
}

function validatePhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 'Preencha seu WhatsApp.';
  if (digits.length < 10) return 'O número precisa ter pelo menos 10 dígitos (com DDD).';
  if (digits.length > 11) return 'O número tem dígitos demais.';
  return null;
}

function validateSelection(value: string): string | null {
  if (!value) return 'Selecione uma opção para continuar.';
  return null;
}

// ─── Phone mask ────────────────────────────────────────────────────

function applyPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

// ─── Step definitions ──────────────────────────────────────────────

type StepDef = {
  id: keyof FormData | 'welcome' | 'success';
  label: string;
  title: string;
  subtitle?: string;
  type: 'welcome' | 'text' | 'email' | 'phone' | 'select' | 'success';
  placeholder?: string;
  options?: string[];
  validate?: (v: string) => string | null;
};

const STEPS: StepDef[] = [
  {
    id: 'welcome',
    label: 'Boas-vindas',
    title: 'Olá! É uma honra ter você por aqui.',
    subtitle:
      'Para que possamos te entregar um atendimento individualizado e de alta performance, precisamos primeiro entender quem você é e qual a sua realidade atual.',
    type: 'welcome',
  },
  {
    id: 'name',
    label: 'Nome',
    title: 'Qual é o seu nome completo?',
    type: 'text',
    placeholder: 'Ex: João da Silva',
    validate: validateName,
  },
  {
    id: 'email',
    label: 'E-mail',
    title: 'Qual o seu melhor e-mail?',
    subtitle: 'Enviaremos as melhores oportunidades por lá.',
    type: 'email',
    placeholder: 'joao@exemplo.com',
    validate: validateEmail,
  },
  {
    id: 'phone',
    label: 'WhatsApp',
    title: 'Qual o seu WhatsApp?',
    subtitle: 'Nosso time entrará em contato por esse número.',
    type: 'phone',
    placeholder: '(00) 00000-0000',
    validate: validatePhone,
  },
  {
    id: 'propertyType',
    label: 'Imóvel',
    title: 'Que tipo de imóvel você busca?',
    type: 'select',
    options: ['Apartamento', 'Casa', 'Terreno', 'Comercial'],
    validate: validateSelection,
  },
  {
    id: 'buyingTimeframe',
    label: 'Prazo',
    title: 'Quando pretende comprar?',
    type: 'select',
    options: ['Imediatamente', 'Em até 3 meses', 'Em até 6 meses', 'Apenas pesquisando'],
    validate: validateSelection,
  },
  {
    id: 'income',
    label: 'Renda',
    title: 'Qual a sua renda familiar mensal?',
    subtitle: 'Essa informação é confidencial e ajuda a encontrar as melhores condições de financiamento.',
    type: 'select',
    options: ['Até R$ 5.000', 'R$ 5.001 a R$ 10.000', 'R$ 10.001 a R$ 20.000', 'Acima de R$ 20.000'],
    validate: validateSelection,
  },
  {
    id: 'downPayment',
    label: 'Entrada',
    title: 'Qual valor disponível para entrada?',
    subtitle: 'O valor da entrada determina diretamente seu poder de financiamento.',
    type: 'select',
    options: ['Até R$ 20.000', 'R$ 20.001 a R$ 50.000', 'R$ 50.001 a R$ 100.000', 'Acima de R$ 100.000'],
    validate: validateSelection,
  },
  {
    id: 'success',
    label: 'Concluído',
    title: 'Aplicação Recebida!',
    subtitle:
      'Obrigado por compartilhar suas informações. Nossa equipe de especialistas vai analisar seu perfil e entrar em contato em breve pelo WhatsApp.',
    type: 'success',
  },
];

const TOTAL_QUESTIONS = STEPS.length - 2; // exclude welcome & success

// ─── Webhook ───────────────────────────────────────────────────────

const WEBHOOK_URL = import.meta.env.DEV
  ? '/api/webhook'
  : 'https://editor.leaderaperformance.com.br/webhook/amauri-form-insta';

// Used when the page is CLOSING (beforeunload) — sendBeacon is the only reliable method
function sendBeaconWebhook(payload: Record<string, unknown>) {
  console.log('[WEBHOOK] sendBeacon (abandono):', payload);
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  navigator.sendBeacon(WEBHOOK_URL, blob);
}

// Used when the page is OPEN (form completed) — regular fetch
async function sendFetchWebhook(payload: Record<string, unknown>) {
  console.log('[WEBHOOK] fetch (completo):', payload);
  try {
    const res = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('[WEBHOOK] response status:', res.status);
  } catch (err) {
    console.error('[WEBHOOK] fetch error:', err);
  }
}

// ─── App ───────────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // Refs to keep fresh values accessible in unload/visibility event handlers
  const stepRef = React.useRef(step);
  const formDataRef = React.useRef(formData);
  const sentRef = React.useRef(false); // prevent duplicate sends

  React.useEffect(() => { stepRef.current = step; }, [step]);
  React.useEffect(() => { formDataRef.current = formData; }, [formData]);

  // ── Abandonment detection (only on actual page close/refresh) ──
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      if (sentRef.current) return; // already sent (completed form)
      sentRef.current = true; // prevent duplicate
      const currentStepIndex = stepRef.current;
      // Only send if user actually started filling (past welcome)
      if (currentStepIndex > 0 && currentStepIndex < STEPS.length - 1) {
        const currentStepDef = STEPS[currentStepIndex];
        sendBeaconWebhook({
          status: 'abandono',
          etapaAbandono: currentStepDef.label,
          etapaNumero: currentStepIndex,
          totalEtapas: TOTAL_QUESTIONS,
          dados: { ...formDataRef.current },
          timestamp: new Date().toISOString(),
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const currentStep = STEPS[step];

  const updateFormData = useCallback(
    (field: keyof FormData, value: string) => {
      let processedValue = value;
      if (field === 'phone') {
        processedValue = applyPhoneMask(value);
      }
      setFormData((prev) => ({ ...prev, [field]: processedValue }));

      // Clear error on change
      const stepDef = STEPS.find((s) => s.id === field);
      if (stepDef?.validate) {
        const err = stepDef.validate(processedValue);
        setErrors((prev) => ({ ...prev, [field]: err }));
      }
    },
    []
  );

  const canProceed = (): boolean => {
    if (currentStep.type === 'welcome' || currentStep.type === 'success') return true;
    const field = currentStep.id as keyof FormData;
    const value = formData[field];
    if (!currentStep.validate) return true;
    return currentStep.validate(value) === null;
  };

  const handleNext = () => {
    if (currentStep.type !== 'welcome' && currentStep.type !== 'success') {
      const field = currentStep.id as keyof FormData;
      const value = formData[field];
      setTouched((prev) => ({ ...prev, [field]: true }));

      if (currentStep.validate) {
        const err = currentStep.validate(value);
        setErrors((prev) => ({ ...prev, [field]: err }));
        if (err) return;
      }
    }

    if (step < STEPS.length - 1) {
      const nextStep = step + 1;

      // Send webhook when reaching the success step (form completed)
      if (STEPS[nextStep].type === 'success') {
        sentRef.current = true;
        sendFetchWebhook({
          status: 'completo',
          etapaAbandono: null,
          etapaNumero: nextStep,
          totalEtapas: TOTAL_QUESTIONS,
          dados: { ...formData },
          timestamp: new Date().toISOString(),
        });
      }

      setDirection(1);
      setStep(nextStep);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canProceed()) {
      e.preventDefault();
      handleNext();
    }
  };

  const questionIndex = step - 1; // 0-based question index (step 0 = welcome)
  const progress = currentStep.type === 'success' ? 100 : Math.max(0, (questionIndex / TOTAL_QUESTIONS) * 100);

  return (
    <div className="min-h-[100dvh] bg-[#0F1338] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
          radial-gradient(circle at 0% 0%, rgba(255, 194, 51, 0.06) 0%, transparent 40%),
          radial-gradient(circle at 100% 100%, rgba(61, 97, 158, 0.12) 0%, transparent 40%)
        `,
        }}
      />

      {/* Welcome Screen – rendered outside AnimatePresence/motion.div with filter
          so that its `fixed inset-0` is relative to the viewport, not a collapsed motion.div */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            key="welcome"
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
          >
            <WelcomeContent step={STEPS[0]} onNext={handleNext} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header – hidden on welcome (it has its own) */}
      <header className={cn("relative z-10 px-5 pt-5 pb-3 flex items-center justify-between", step === 0 && "hidden")}>
        <img
          src={logoImg}
          alt="Amauri Assessoria Imobiliária"
          className="h-10 w-auto brightness-0 invert"
        />
        {step > 0 && step < STEPS.length - 1 && (
          <span className="text-xs font-semibold text-[#94A3B8] tracking-[1px] tabular-nums">
            {questionIndex}/{TOTAL_QUESTIONS}
          </span>
        )}
      </header>

      {/* Progress Bar */}
      {step > 0 && step < STEPS.length - 1 && (
        <div className="relative z-10 px-5">
          <div className="w-full h-1 bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#FFC233] rounded-full"
              style={{ boxShadow: '0 0 10px rgba(255, 194, 51, 0.3)' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col w-full max-w-[480px] mx-auto px-5 py-6" onKeyDown={handleKeyDown}>
        <div className="my-auto">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={(d: number) => ({ opacity: 0, x: d * 80, scale: 0.96, filter: 'blur(6px)' })}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={(d: number) => ({ opacity: 0, x: d * -80, scale: 0.96, filter: 'blur(6px)' })}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex-none"
          >
            {currentStep.type === 'success' && <SuccessContent step={currentStep} />}
            {currentStep.type === 'text' && (
              <TextInputContent
                step={currentStep}
                value={formData[currentStep.id as keyof FormData]}
                error={touched[currentStep.id] ? errors[currentStep.id] ?? null : null}
                onChange={(v) => updateFormData(currentStep.id as keyof FormData, v)}
                onBlur={() => {
                  setTouched((p) => ({ ...p, [currentStep.id]: true }));
                  if (currentStep.validate) {
                    setErrors((p) => ({
                      ...p,
                      [currentStep.id]: currentStep.validate!(formData[currentStep.id as keyof FormData]),
                    }));
                  }
                }}
              />
            )}
            {currentStep.type === 'email' && (
              <TextInputContent
                step={currentStep}
                value={formData[currentStep.id as keyof FormData]}
                error={touched[currentStep.id] ? errors[currentStep.id] ?? null : null}
                onChange={(v) => updateFormData(currentStep.id as keyof FormData, v)}
                onBlur={() => {
                  setTouched((p) => ({ ...p, [currentStep.id]: true }));
                  if (currentStep.validate) {
                    setErrors((p) => ({
                      ...p,
                      [currentStep.id]: currentStep.validate!(formData[currentStep.id as keyof FormData]),
                    }));
                  }
                }}
                inputType="email"
              />
            )}
            {currentStep.type === 'phone' && (
              <TextInputContent
                step={currentStep}
                value={formData[currentStep.id as keyof FormData]}
                error={touched[currentStep.id] ? errors[currentStep.id] ?? null : null}
                onChange={(v) => updateFormData(currentStep.id as keyof FormData, v)}
                onBlur={() => {
                  setTouched((p) => ({ ...p, [currentStep.id]: true }));
                  if (currentStep.validate) {
                    setErrors((p) => ({
                      ...p,
                      [currentStep.id]: currentStep.validate!(formData[currentStep.id as keyof FormData]),
                    }));
                  }
                }}
                inputType="tel"
              />
            )}
            {currentStep.type === 'select' && (
              <SelectContent
                step={currentStep}
                value={formData[currentStep.id as keyof FormData]}
                onChange={(v) => {
                  console.log('[DEBUG] Select clicked:', currentStep.id, '=', v, 'current step:', step);
                  updateFormData(currentStep.id as keyof FormData, v);
                  setTouched((p) => ({ ...p, [currentStep.id]: true }));
                  setErrors((p) => ({ ...p, [currentStep.id]: null }));

                  const nextStep = step + 1;
                  console.log('[DEBUG] nextStep:', nextStep, 'total STEPS:', STEPS.length, 'nextType:', STEPS[nextStep]?.type);

                  // Auto-advance on select
                  setTimeout(() => {
                    console.log('[DEBUG] setTimeout fired, nextStep:', nextStep);
                    // If next step is success, send completion webhook
                    if (nextStep < STEPS.length && STEPS[nextStep].type === 'success') {
                      console.log('[DEBUG] SENDING COMPLETION WEBHOOK');
                      sentRef.current = true;
                      sendFetchWebhook({
                        status: 'completo',
                        etapaAbandono: null,
                        etapaNumero: nextStep,
                        totalEtapas: TOTAL_QUESTIONS,
                        dados: { ...formDataRef.current },
                        timestamp: new Date().toISOString(),
                      });
                    }
                    setDirection(1);
                    setStep(nextStep);
                  }, 300);
                }}
                error={touched[currentStep.id] ? errors[currentStep.id] ?? null : null}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep.type !== 'success' && currentStep.type !== 'welcome' && (
          <div className="pt-8 pb-2">
            {currentStep.type !== 'select' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  className="w-12 h-12 rounded-2xl border border-[rgba(61,97,158,0.3)] bg-[rgba(61,97,158,0.1)] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-[#3D619E] transition-all active:scale-95 shrink-0"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={cn(
                    'flex-1 py-4 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 active:scale-[0.97]',
                    canProceed()
                      ? 'bg-[#FFC233] text-[#0F1338]'
                      : 'bg-[rgba(61,97,158,0.15)] text-[#64748B] cursor-not-allowed'
                  )}
                  style={canProceed() ? { boxShadow: '0 8px 24px rgba(255, 194, 51, 0.25)' } : undefined}
                >
                  Continuar
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 text-[#94A3B8] hover:text-white font-semibold transition-colors bg-transparent border-none active:scale-95"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Voltar
                </button>
              </div>
            )}

            {/* Keyboard hint – mobile users won't see this */}
            {currentStep.type !== 'select' && canProceed() && (
              <p className="text-center text-[#64748B] text-xs mt-3 hidden sm:block">
                pressione <span className="font-mono bg-[rgba(255,255,255,0.06)] px-1.5 py-0.5 rounded text-[#94A3B8]">Enter ↵</span> para continuar
              </p>
            )}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

// ─── Content Components ────────────────────────────────────────────

function WelcomeContent({ step, onNext }: { step: StepDef; onNext: () => void }) {
  return (
    <div className="fixed inset-0 z-20 flex flex-col overflow-hidden">
      {/* Full Background Photo */}
      <img
        src={amauriPhoto}
        alt="Amauri - Assessor Imobiliário"
        className="absolute inset-0 w-full h-full object-cover scale-[1.1]"
        style={{ objectPosition: 'center 15%' }}
      />

      {/* Multi-layer gradient for depth (not flat) */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg,
              rgba(15, 19, 56, 0) 0%,
              rgba(15, 19, 56, 0.05) 20%,
              rgba(15, 19, 56, 0.4) 45%,
              rgba(15, 19, 56, 0.85) 62%,
              rgba(15, 19, 56, 0.97) 78%,
              rgb(15, 19, 56) 100%
            )
          `,
        }}
      />
      {/* Radial glow for visual interest */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(61, 97, 158, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 35%, rgba(255, 194, 51, 0.08) 0%, transparent 40%),
            radial-gradient(ellipse at 50% 90%, rgba(61, 97, 158, 0.12) 0%, transparent 50%)
          `,
        }}
      />

      {/* Logo at top */}
      <div className="relative z-10 px-5 pt-5">
        <img
          src={logoImg}
          alt="Amauri Assessoria Imobiliária"
          className="h-9 w-auto brightness-0 invert opacity-90"
        />
      </div>

      {/* Spacer to push content down */}
      <div className="flex-1" />

      {/* Content at the bottom */}
      <div className="relative z-10 px-5 pb-8 space-y-3">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-[#FFC233] text-xs font-bold uppercase tracking-[2px] block"
        >
          Boas-vindas
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-[1.6rem] leading-[1.25] font-bold tracking-[-0.02em]"
        >
          {step.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[#CBD5E1] text-[0.875rem] leading-relaxed"
        >
          {step.subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[rgba(30,33,88,0.65)] border border-[rgba(61,97,158,0.25)] p-3.5 rounded-xl backdrop-blur-md"
        >
          <p className="text-xs text-[#FFC233] font-semibold mb-1 uppercase tracking-[1px]">💡 Compromisso Mútuo</p>
          <p className="text-[#94A3B8] text-xs leading-[1.55]">
            Ao preencher este formulário, você demonstra interesse real e nos permite dar atenção prioritária a quem está decidido a realizar o sonho da casa própria.
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onNext}
          className="w-full bg-[#FFC233] text-[#0F1338] py-3.5 rounded-2xl font-bold text-base transition-all active:scale-[0.97] flex items-center justify-center gap-2 mt-2"
          style={{ boxShadow: '0 8px 24px rgba(255, 194, 51, 0.3)' }}
        >
          Começar Aplicação
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>
    </div>
  );
}

function SuccessContent({ step }: { step: StepDef }) {
  const [countdown, setCountdown] = useState(3);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = 'https://www.amaurinobre.com.br/';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5, delay: 0.1 }}
        className="w-20 h-20 bg-[rgba(255,194,51,0.12)] text-[#FFC233] rounded-full flex items-center justify-center border border-[rgba(255,194,51,0.25)]"
        style={{ boxShadow: '0 0 40px rgba(255, 194, 51, 0.2)' }}
      >
        <CheckCircle2 className="w-10 h-10" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h2 className="text-[1.75rem] font-bold tracking-tight">{step.title}</h2>
        <p className="text-[#94A3B8] text-base leading-relaxed max-w-[320px] mx-auto">{step.subtitle}</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="space-y-2 pt-2"
      >
        <p className="text-[#64748B] text-sm">
          Redirecionando em <span className="text-[#FFC233] font-bold">{countdown}s</span>...
        </p>
        <a
          href="https://www.amaurinobre.com.br/"
          className="text-[#FFC233] text-sm font-semibold underline underline-offset-2 hover:text-white transition-colors"
        >
          Ir para o site agora →
        </a>
      </motion.div>
    </div>
  );
}

function TextInputContent({
  step,
  value,
  error,
  onChange,
  onBlur,
  inputType = 'text',
}: {
  step: StepDef;
  value: string;
  error: string | null;
  onChange: (v: string) => void;
  onBlur: () => void;
  inputType?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[1.5rem] leading-[1.3] font-bold tracking-[-0.01em]"
        >
          {step.title}
        </motion.h1>
        {step.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#94A3B8] text-sm leading-relaxed"
          >
            {step.subtitle}
          </motion.p>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-2"
      >
        <input
          type={inputType}
          inputMode={inputType === 'tel' ? 'tel' : inputType === 'email' ? 'email' : 'text'}
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          className={cn(
            'w-full bg-[rgba(255,255,255,0.05)] border rounded-2xl px-5 py-4 text-white text-lg outline-none transition-all placeholder:text-[#475569]',
            error
              ? 'border-red-500/60 focus:border-red-400'
              : 'border-[rgba(61,97,158,0.3)] focus:border-[#FFC233] focus:bg-[rgba(61,97,158,0.15)]'
          )}
          placeholder={step.placeholder}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-red-400 text-sm"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function SelectContent({
  step,
  value,
  onChange,
  error,
}: {
  step: StepDef;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-[1.5rem] leading-[1.3] font-bold tracking-[-0.01em]"
        >
          {step.title}
        </motion.h1>
        {step.subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="text-[#94A3B8] text-sm leading-relaxed"
          >
            {step.subtitle}
          </motion.p>
        )}
      </div>

      <div className="space-y-3">
        {step.options?.map((option, i) => (
          <motion.button
            key={option}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.1 + i * 0.07,
              duration: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={() => onChange(option)}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98]',
              value === option
                ? 'bg-[rgba(255,194,51,0.12)] border-[#FFC233]'
                : 'bg-[rgba(30,33,88,0.5)] border-[rgba(61,97,158,0.25)] active:bg-[rgba(61,97,158,0.2)]'
            )}
          >
            <div
              className={cn(
                'w-5 h-5 rounded-full border-2 relative shrink-0 transition-colors',
                value === option ? 'border-[#FFC233]' : 'border-[rgba(61,97,158,0.3)]'
              )}
            >
              {value === option && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  className="absolute inset-0 m-auto w-[10px] h-[10px] bg-[#FFC233] rounded-full"
                />
              )}
            </div>
            <span className="font-medium text-base">{option}</span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1.5 text-red-400 text-sm"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
