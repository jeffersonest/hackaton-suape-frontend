"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ClipboardText, ChartLine, Shield } from "@phosphor-icons/react";
import { LoginForm } from "@/features/auth/components";
import { useSessionStore } from "@/features/auth";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const accessToken = useSessionStore((state) => state.accessToken);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && accessToken) {
      router.replace("/home");
    }
  }, [hydrated, accessToken, router]);

  if (!hydrated) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Left Panel - Branding */}
      <div className={styles.panelLeft}>
        <div className={styles.panelContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <img 
              src="/images/logo-suape.png" 
              alt="Suape" 
              className={styles.logoImage}
            />
          </div>

          {/* Headline */}
          <div className={styles.headline}>
            <h1>
              Gestão inteligente de licenças portuárias
            </h1>
            <p>
              A plataforma que transforma a burocracia em agilidade. 
              Consulte, acompanhe e gerencie licenças do Porto de Suape 
              com segurança e eficiência.
            </p>
          </div>

          {/* Features */}
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <ClipboardText size={22} weight="duotone" />
              </div>
              <div className={styles.featureText}>
                <h3>Licenças Online</h3>
                <p>Consulte e acompanhe o status de todas as licenças em tempo real</p>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <ChartLine size={22} weight="duotone" />
              </div>
              <div className={styles.featureText}>
                <h3>AI Assistente</h3>
                <p>Tire dúvidas instantaneamente com nosso assistente inteligente</p>
              </div>
            </div>

            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Shield size={22} weight="duotone" />
              </div>
              <div className={styles.featureText}>
                <h3>Segurança Total</h3>
                <p>Seus dados protegidos com criptografia de ponta</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <p>
              SUAPE – Complexo Industrial Portuário Governador Eraldo Gueiros
            </p>
            <p className={styles.footerSub}>
              Secretaria de Desenvolvimento Econômico de Pernambuco
            </p>
          </div>
        </div>

        {/* Background decoration */}
        <div className={styles.bgDecoration}>
          <div className={styles.bgCircle1} />
          <div className={styles.bgCircle2} />
          <div className={styles.bgCircle3} />
          <div className={styles.bgWaves}>
            <div className={styles.bgWave} />
            <div className={styles.bgWave} />
            <div className={styles.bgWave} />
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={styles.panelRight}>
        <div className={styles.formContainer}>
          <LoginForm />
          
          <div className={styles.footer}>
            <p>
              Ao entrar, você concorda com os{" "}
              <Link href="/termos">Termos de Uso</Link> e{" "}
              <Link href="/privacidade">Política de Privacidade</Link>
            </p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className={styles.waveDecoration}>
          <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,90 1440,60 L1440,120 L0,120 Z" fill="rgba(45,96,173,0.03)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
