import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  KeyRound
} from 'lucide-react';
import api from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: any, token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [email, setEmail] = useState('eduardo.donato@jtoledo.com.br');
  const [password, setPassword] = useState('Suzuki@2026');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modo troca de senha temporária
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tempUser, setTempUser] = useState<any>(null);
  const [tempToken, setTempToken] = useState<string>('');

  // Modo Esqueci Minha Senha
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const data = await api.login(email, password);

      if (data.user?.mustChangePassword) {
        setTempUser(data.user);
        setTempToken(data.token);
        localStorage.setItem('portal_suzuki_token', data.token);
        setIsChangingPassword(true);
        setLoading(false);
        return;
      }

      localStorage.setItem('portal_suzuki_token', data.token);
      localStorage.setItem('portal_suzuki_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setForgotSuccess(null);
    setLoading(true);

    try {
      const data = await api.forgotPassword(forgotEmail || email);
      setForgotSuccess(data);
      // Preenche os campos de login com os dados gerados para facilitar
      setEmail(data.userEmail);
      if (data.temporaryPassword) {
        setPassword(data.temporaryPassword);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao recuperar senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword !== confirmPassword) {
      setErrorMessage('A confirmação da nova senha não confere.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);

    try {
      await api.changePassword(password, newPassword);
      localStorage.setItem('portal_suzuki_user', JSON.stringify(tempUser));
      onLoginSuccess(tempUser, tempToken);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8">
        
        {/* Header do Modal com Logo Suzuki Oficial */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-slate-50 dark:bg-neutral-800 p-3.5 rounded-2xl border border-slate-200/80 dark:border-neutral-700 shadow-xs mb-4">
            <img 
              src="/suzuki-logo.png" 
              alt="Suzuki Motos Brasil" 
              className="h-10 w-auto object-contain"
            />
          </div>

          <h2 className="text-[20px] font-black tracking-tight text-slate-900 dark:text-white">
            {isForgotPassword 
              ? 'Recuperar Senha de Acesso' 
              : isChangingPassword 
              ? 'Redefinir Senha Temporária' 
              : 'Portal Oficial Suzuki'}
          </h2>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            {isForgotPassword
              ? 'Informe seu e-mail corporativo para gerar uma senha de acesso provisória.'
              : isChangingPassword 
              ? 'Por segurança corporativa, defina uma nova senha definitiva.' 
              : 'Acesso B2B Concessionárias & Montadora J. Toledo'
            }
          </p>
        </div>

        {/* Notificação de Erro */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 flex items-center gap-2.5 text-red-600 dark:text-red-400 text-[12px]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Notificação de Sucesso Recuperação */}
        {forgotSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[12px] space-y-2">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{forgotSuccess.message}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">
              Usuário: <span className="font-semibold text-slate-900 dark:text-white">{forgotSuccess.userName}</span>
            </p>
            <div className="bg-white dark:bg-neutral-800 p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-between">
              <span className="text-slate-500 text-[11px]">Senha Provisória:</span>
              <span className="font-mono font-bold text-[14px] text-blue-600 dark:text-blue-400">{forgotSuccess.temporaryPassword}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsForgotPassword(false);
                setForgotSuccess(null);
              }}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[11px] transition-colors mt-2"
            >
              Fazer Login com esta Senha
            </button>
          </div>
        )}

        {/* 1. Tela de Esqueci Minha Senha */}
        {isForgotPassword && !forgotSuccess ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                E-mail Corporativo Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={forgotEmail || email}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="ex: seu.nome@jtoledo.com.br ou @motosul.com.br"
                  className="w-full bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-3.5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? <span>Processando...</span> : <span>Gerar Senha de Recuperação</span>}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMessage(null);
                }}
                className="text-[12px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                ← Voltar para o Login
              </button>
            </div>
          </form>
        ) : !isChangingPassword && !forgotSuccess ? (
          /* 2. Formulário de Login Padrão */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                E-mail Corporativo
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@jtoledo.com.br ou @concessionaria.com.br"
                  className="w-full bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-3.5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setErrorMessage(null);
                    setForgotSuccess(null);
                    setForgotEmail(email);
                  }}
                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium transition-colors"
                >
                  Esqueci minha senha
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-3.5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Entrar no Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-3 border-t border-slate-100 dark:border-neutral-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                Conectado ao SQL Server (172.16.0.31:1433) • SSL Ativo
              </span>
            </div>
          </form>
        ) : isChangingPassword ? (
          /* Formulário de Primeiro Acesso (Troca de Senha) */
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Nova Senha
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-3.5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                Confirmar Nova Senha
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-slate-50 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-xl py-2.5 pl-10 pr-3.5 text-[13px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[13px] tracking-wide flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? <span>Salvando...</span> : <span>Confirmar Nova Senha</span>}
            </button>
          </form>
        ) : null}

      </div>
    </div>
  );
};

export default LoginModal;
