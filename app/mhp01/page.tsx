// Arquivo: src/app/mhp02/page.tsx

import Calculadora, { EmailPlan } from "../../components/Calculadora";

// TABELA 2: Custo Revenda
const EMAIL_PLANS_MHP02: EmailPlan[] = [
  {
    id: "2gb_1m",
    name: "2GB + 1 Mês de arquivamento",
    baseCost: 0,
    jumpCost: 1.3,
    suggestedBase: 0,
    archiveTime: "1 Mês",
  },
  {
    id: "10gb_90d",
    name: "10GB + 90 dias de arquivamento",
    baseCost: 0,
    jumpCost: 1.95,
    suggestedBase: 0,
    archiveTime: "3 Meses",
  },
  {
    id: "25gb_1a",
    name: "25GB + 1 Ano de arquivamento",
    baseCost: 0,
    jumpCost: 2.6,
    suggestedBase: 0,
    archiveTime: "1 Ano",
  },
  {
    id: "50gb_2a",
    name: "50GB + 2 Anos de arquivamento",
    baseCost: 0,
    jumpCost: 3.9,
    suggestedBase: 0,
    archiveTime: "2 Anos",
  },
  {
    id: "10gb_10a",
    name: "10GB + 10 Anos de arquivamento",
    baseCost: 0,
    jumpCost: 5.85,
    suggestedBase: 0,
    archiveTime: "10 Anos",
  },
  {
    id: "25gb_10a",
    name: "25GB + 10 Anos de arquivamento",
    baseCost: 0,
    jumpCost: 6.5,
    suggestedBase: 0,
    archiveTime: "10 Anos",
  },
  {
    id: "50gb_10a",
    name: "50GB + 10 Anos de arquivamento",
    baseCost: 0,
    jumpCost: 7.8,
    suggestedBase: 0,
    archiveTime: "10 Anos",
  },
];

export default function PageMHP02() {
  return (
    <Calculadora
      planosEmail={EMAIL_PLANS_MHP02}
      //   tituloRota="Tabela Base (R$ 1,30)"
    />
  );
}
