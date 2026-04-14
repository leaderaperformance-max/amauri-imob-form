import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Home, CheckCircle2 } from 'lucide-react';
import { cn } from './lib/utils';

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

export default function App() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(circle at 0% 0%, rgba(242, 125, 38, 0.08) 0%, transparent 40%),
          radial-gradient(circle at 100% 100%, rgba(30, 64, 175, 0.1) 0%, transparent 40%)
        `
      }} />

      {/* Header */}
      <header className="relative z-10 p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="font-extrabold tracking-[2px] text-lg uppercase">
          Amauri <span className="text-[#F27D26]">Imobiliária</span>
        </div>
        {step > 0 && step < 4 && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-[#94A3B8] tracking-[1px] uppercase">
              Etapa 0{step} de 03
            </span>
            <div className="w-32 md:w-[200px] h-1 bg-[rgba(255,255,255,0.1)] rounded-sm overflow-hidden">
              <motion.div
                className="h-full bg-[#F27D26]"
                style={{ boxShadow: '0 0 10px rgba(242, 125, 38, 0.2)' }}
                initial={{ width: `${((step - 1) / 3) * 100}%` }}
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col max-w-[1024px] w-full mx-auto p-6 md:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full flex flex-col"
          >
            {step === 0 && <WelcomeScreen onNext={nextStep} />}
            {step === 1 && (
              <PersonalStep
                data={formData}
                updateData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {step === 2 && (
              <PreferencesStep
                data={formData}
                updateData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {step === 3 && (
              <FinancialStep
                data={formData}
                updateData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
              />
            )}
            {step === 4 && <SuccessScreen />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Step Components ---

function WelcomeScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="grid md:grid-cols-[1fr_380px] gap-10 md:gap-[60px] items-start h-full">
      <div className="space-y-8">
        <span className="text-[#F27D26] text-sm font-bold uppercase tracking-[2px] block">
          Boas-vindas
        </span>
        <h1 className="text-4xl md:text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em]">
          Olá! É uma honra ter você por aqui.
        </h1>
        <div className="space-y-6 text-[#94A3B8] text-lg leading-relaxed">
          <p>
            Para que possamos te entregar um atendimento individualizado e de alta performance, precisamos primeiro entender quem você é e qual a sua realidade atual.
          </p>
          <p>
            A compra de um imóvel envolve diversos fatores técnicos e financeiros, por isso coletamos esses dados para direcionar você sempre à melhor solução.
          </p>
        </div>
      </div>

      <aside className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-8 rounded-[24px] backdrop-blur-md">
        <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full text-[0.7rem] uppercase inline-block mb-5">
          💡 Por que somos criteriosos?
        </div>
        <h3 className="text-sm uppercase text-[#F27D26] mb-4 tracking-[1px] font-semibold">
          Compromisso Mútuo
        </h3>
        <p className="text-[#94A3B8] leading-[1.6] text-[0.95rem]">
          Nossa demanda é extremamente alta e prezamos por uma troca mútua de compromisso. Ao preencher este formulário de aplicação, você demonstra que tem interesse real em comprar o seu imóvel e nos permite dar atenção prioritária a quem, como você, está decidido a realizar esse sonho.
          <br /><br />
          Pode ter certeza: cada campo preenchido te deixa muito mais próximo das chaves na mão.
        </p>
      </aside>

      <div className="md:col-span-2 mt-auto pt-10 flex justify-end">
        <button
          onClick={onNext}
          className="bg-[#F27D26] text-black px-10 py-4 rounded-full font-bold text-base hover:scale-105 transition-transform flex items-center gap-2"
          style={{ boxShadow: '0 10px 30px rgba(242, 125, 38, 0.2)' }}
        >
          Começar Aplicação
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function PersonalStep({
  data,
  updateData,
  onNext,
  onPrev,
}: {
  data: FormData;
  updateData: (f: keyof FormData, v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const isValid = data.name.length > 2 && data.email.includes('@') && data.phone.length > 8;

  return (
    <div className="flex flex-col h-full">
      <div className="grid md:grid-cols-[1fr_380px] gap-10 md:gap-[60px] items-start flex-1">
        <div className="space-y-8">
          <span className="text-[#F27D26] text-sm font-bold uppercase tracking-[2px] block">
            Dados Pessoais
          </span>
          <h1 className="text-4xl md:text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em]">
            Como podemos entrar em contato com você?
          </h1>

          <div className="space-y-5 mt-8">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">Nome Completo</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => updateData('name', e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-5 py-4 text-white focus:border-[#F27D26] focus:bg-[rgba(255,255,255,0.08)] outline-none transition-all"
                placeholder="Ex: João da Silva"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">E-mail</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => updateData('email', e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-5 py-4 text-white focus:border-[#F27D26] focus:bg-[rgba(255,255,255,0.08)] outline-none transition-all"
                placeholder="joao@exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-2">WhatsApp</label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => updateData('phone', e.target.value)}
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-5 py-4 text-white focus:border-[#F27D26] focus:bg-[rgba(255,255,255,0.08)] outline-none transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <aside className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-8 rounded-[24px] backdrop-blur-md hidden md:block">
          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full text-[0.7rem] uppercase inline-block mb-5">
            💡 Privacidade
          </div>
          <h3 className="text-sm uppercase text-[#F27D26] mb-4 tracking-[1px] font-semibold">
            Seus dados estão seguros
          </h3>
          <p className="text-[#94A3B8] leading-[1.6] text-[0.95rem]">
            Utilizamos suas informações de contato exclusivamente para enviar oportunidades de imóveis que se encaixam no seu perfil e para que nossos corretores possam te auxiliar na jornada de compra.
          </p>
        </aside>
      </div>

      <StepNavigation onPrev={onPrev} onNext={onNext} isValid={isValid} />
    </div>
  );
}

function PreferencesStep({
  data,
  updateData,
  onNext,
  onPrev,
}: {
  data: FormData;
  updateData: (f: keyof FormData, v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const isValid = data.propertyType !== '' && data.buyingTimeframe !== '';

  const propertyTypes = ['Apartamento', 'Casa', 'Terreno', 'Comercial'];
  const timeframes = ['Imediatamente', 'Em até 3 meses', 'Em até 6 meses', 'Apenas pesquisando'];

  return (
    <div className="flex flex-col h-full">
      <div className="grid md:grid-cols-[1fr_380px] gap-10 md:gap-[60px] items-start flex-1">
        <div className="space-y-8">
          <span className="text-[#F27D26] text-sm font-bold uppercase tracking-[2px] block">
            O Imóvel Ideal
          </span>
          <h1 className="text-4xl md:text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em]">
            O que você está buscando no momento?
          </h1>

          <div className="space-y-8 mt-8">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-4">Tipo de Imóvel</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {propertyTypes.map((type) => (
                  <OptionCard
                    key={type}
                    label={type}
                    selected={data.propertyType === type}
                    onClick={() => updateData('propertyType', type)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-4">Quando pretende comprar?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeframes.map((time) => (
                  <OptionCard
                    key={time}
                    label={time}
                    selected={data.buyingTimeframe === time}
                    onClick={() => updateData('buyingTimeframe', time)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-8 rounded-[24px] backdrop-blur-md hidden md:block">
          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full text-[0.7rem] uppercase inline-block mb-5">
            💡 Direcionamento
          </div>
          <h3 className="text-sm uppercase text-[#F27D26] mb-4 tracking-[1px] font-semibold">
            Foco no que importa
          </h3>
          <p className="text-[#94A3B8] leading-[1.6] text-[0.95rem]">
            Saber o tipo de imóvel e o seu prazo nos ajuda a filtrar apenas as opções que fazem sentido para o seu momento de vida, poupando seu tempo com visitas desnecessárias.
          </p>
        </aside>
      </div>

      <StepNavigation onPrev={onPrev} onNext={onNext} isValid={isValid} />
    </div>
  );
}

function FinancialStep({
  data,
  updateData,
  onNext,
  onPrev,
}: {
  data: FormData;
  updateData: (f: keyof FormData, v: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  const isValid = data.income !== '' && data.downPayment !== '';

  const incomeRanges = ['Até R$ 5.000', 'R$ 5.001 a R$ 10.000', 'R$ 10.001 a R$ 20.000', 'Acima de R$ 20.000'];
  const downPaymentRanges = ['Até R$ 20.000', 'R$ 20.001 a R$ 50.000', 'R$ 50.001 a R$ 100.000', 'Acima de R$ 100.000'];

  return (
    <div className="flex flex-col h-full">
      <div className="grid md:grid-cols-[1fr_380px] gap-10 md:gap-[60px] items-start flex-1">
        <div className="space-y-8">
          <span className="text-[#F27D26] text-sm font-bold uppercase tracking-[2px] block">
            Perfil Financeiro
          </span>
          <h1 className="text-4xl md:text-[2.5rem] leading-[1.2] font-bold tracking-[-0.02em]">
            Essas informações ajudam a encontrar as melhores condições.
          </h1>

          <div className="space-y-8 mt-8">
            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-4">Renda Familiar Mensal</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {incomeRanges.map((range) => (
                  <OptionCard
                    key={range}
                    label={range}
                    selected={data.income === range}
                    onClick={() => updateData('income', range)}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#94A3B8] mb-4">Valor disponível para entrada</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {downPaymentRanges.map((range) => (
                  <OptionCard
                    key={range}
                    label={range}
                    selected={data.downPayment === range}
                    onClick={() => updateData('downPayment', range)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.1)] p-8 rounded-[24px] backdrop-blur-md hidden md:block">
          <div className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] px-3 py-1 rounded-full text-[0.7rem] uppercase inline-block mb-5">
            💡 Por que perguntamos isso?
          </div>
          <h3 className="text-sm uppercase text-[#F27D26] mb-4 tracking-[1px] font-semibold">
            A pergunta mais importante
          </h3>
          <p className="text-[#94A3B8] leading-[1.6] text-[0.95rem]">
            O valor da entrada e sua renda determinam diretamente seu poder de financiamento, o padrão do imóvel e a localização.
            <br /><br />
            Quanto mais clara for essa informação, mais precisa será a nossa estratégia para encontrar o imóvel que cabe perfeitamente no seu bolso.
          </p>
        </aside>
      </div>

      <StepNavigation onPrev={onPrev} onNext={onNext} isValid={isValid} isLast />
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-8 py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-24 h-24 bg-[rgba(242,125,38,0.1)] text-[#F27D26] rounded-full flex items-center justify-center mx-auto border border-[rgba(242,125,38,0.2)]"
        style={{ boxShadow: '0 0 40px rgba(242, 125, 38, 0.2)' }}
      >
        <CheckCircle2 className="w-12 h-12" />
      </motion.div>
      <div className="space-y-4">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Aplicação Recebida!</h2>
        <p className="text-[#94A3B8] text-lg max-w-lg mx-auto leading-relaxed">
          Obrigado por compartilhar suas informações. Nossa equipe de especialistas vai analisar seu perfil e entrar em contato em breve.
        </p>
      </div>
    </div>
  );
}

// --- Shared UI Components ---

function OptionCard({ label, selected, onClick }: { key?: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 p-5 rounded-xl border text-left transition-all duration-200",
        selected
          ? "bg-[rgba(242,125,38,0.2)] border-[#F27D26]"
          : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.08)] hover:border-[#F27D26] hover:-translate-y-0.5"
      )}
    >
      <div
        className={cn(
          "w-[18px] h-[18px] rounded-full border-2 relative shrink-0 transition-colors",
          selected ? "border-[#F27D26]" : "border-[rgba(255,255,255,0.1)]"
        )}
      >
        {selected && (
          <div className="absolute inset-0 m-auto w-[10px] h-[10px] bg-[#F27D26] rounded-full" />
        )}
      </div>
      <span className="font-medium text-[1.1rem]">{label}</span>
    </button>
  );
}

function StepNavigation({
  onPrev,
  onNext,
  isValid,
  isLast = false,
}: {
  onPrev: () => void;
  onNext: () => void;
  isValid: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex items-center justify-between pt-10 mt-auto">
      <button
        onClick={onPrev}
        className="flex items-center gap-2 text-[#94A3B8] hover:text-white font-semibold transition-colors bg-transparent border-none cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
        Voltar
      </button>
      <button
        onClick={onNext}
        disabled={!isValid}
        className={cn(
          "px-10 py-4 rounded-full font-bold text-base transition-all flex items-center gap-2",
          isValid
            ? "bg-[#F27D26] text-black hover:scale-105 cursor-pointer"
            : "bg-[rgba(255,255,255,0.1)] text-[#94A3B8] cursor-not-allowed"
        )}
        style={isValid ? { boxShadow: '0 10px 30px rgba(242, 125, 38, 0.2)' } : undefined}
      >
        {isLast ? 'Finalizar Aplicação' : 'Próximo Passo'}
        {!isLast && <ChevronRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
