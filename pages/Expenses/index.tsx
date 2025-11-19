import React from 'react';
import { RefreshCw, Bot, Gem, Wallet, ShieldCheck } from 'lucide-react';
import { MOCK_EXPENSES } from '../../constants';
import { ExpenseRecord } from '../../types';

interface ExpensesPageProps {
  t: {
    title: string;
    subtitle: string;
    balanceLabel: string;
    convertPoints: string;
    buttons: {
      points: string;
      balance: string;
      freeMember: string;
      refresh: string;
    };
    recordsTitle: string;
    refreshData: string;
    record: {
      type: string;
      duration: string;
      input: string;
      output: string;
      consumption: string;
    }
  };
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ t }) => {
  return (
    <div className="bg-background min-h-screen pb-12">
      
      {/* Purple Header Section */}
      <div className="w-full bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-700 dark:to-indigo-900 text-white py-12 px-4 shadow-md">
        <div className="container mx-auto text-center max-w-5xl">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-indigo-100 opacity-90 mb-8">{t.subtitle}</p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-white/20 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
             <div className="text-left">
                <div className="text-5xl md:text-6xl font-bold mb-2 flex items-baseline gap-2">
                  <span className="text-3xl opacity-80">¥</span> 351.28
                </div>
                <div className="text-indigo-100 font-medium flex items-center gap-2">
                  {t.balanceLabel} <span className="opacity-60">|</span> <span className="text-yellow-300">{t.convertPoints}: 175.64</span>
                </div>
             </div>
             
             <div className="flex flex-wrap justify-center md:justify-end gap-3">
                <ActionButton icon={Gem} label={t.buttons.points} color="bg-indigo-500/30" />
                <ActionButton icon={Wallet} label={t.buttons.balance} color="bg-yellow-500/30" />
                <ActionButton icon={ShieldCheck} label={t.buttons.freeMember} color="bg-green-500/30" />
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm font-medium backdrop-blur-sm border border-white/10">
                  <RefreshCw size={16} />
                  {t.buttons.refresh}
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Usage Records Section */}
      <div className="container mx-auto px-4 -mt-6 max-w-6xl">
        <div className="bg-surface rounded-t-2xl p-6 border border-border shadow-sm min-h-[500px]">
           <div className="flex items-center justify-between mb-6 border-l-4 border-indigo-500 pl-4">
              <h2 className="text-xl font-bold text-foreground">{t.recordsTitle}</h2>
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 transition-colors shadow">
                 <RefreshCw size={14} />
                 {t.refreshData}
              </button>
           </div>

           {/* Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_EXPENSES.map((record) => (
                 <ExpenseCard key={record.id} record={record} t={t} />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon: Icon, label, color }: any) => (
  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${color} hover:bg-opacity-40 transition-all text-sm font-medium border border-white/10`}>
    <Icon size={16} />
    {label}
  </button>
);

const ExpenseCard = ({ record, t }: { record: ExpenseRecord, t: ExpensesPageProps['t'] }) => {
  return (
    <div className="bg-background border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-indigo-200 dark:hover:border-indigo-800">
       <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
             <Bot size={18} />
          </div>
          <span className="font-semibold text-foreground truncate">{record.modelName}</span>
       </div>
       
       <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
          <span className="text-red-600 dark:text-red-400 font-bold text-sm">¥ {record.cost.toFixed(6)}</span>
       </div>
       
       <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs mb-4">
          <div>
             <span className="text-muted block mb-0.5">{t.record.type}:</span>
             <span className="inline-block px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded text-[10px] font-medium border border-red-200 dark:border-red-800">
               {t.record.consumption}
             </span>
          </div>
          <div>
             <span className="text-muted block mb-0.5">{t.record.duration}:</span>
             <span className="font-medium text-foreground">{record.duration}</span>
          </div>
          <div>
             <span className="text-muted block mb-0.5">{t.record.input}:</span>
             <span className="font-medium text-foreground">{record.inputTokens}</span>
          </div>
          <div>
             <span className="text-muted block mb-0.5">{t.record.output}:</span>
             <span className="font-medium text-foreground">{record.outputTokens}</span>
          </div>
       </div>
       
       <div className="pt-3 border-t border-border text-[10px] text-muted flex items-center gap-1">
          <ClockIcon />
          {record.timestamp}
       </div>
    </div>
  );
};

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default ExpensesPage;