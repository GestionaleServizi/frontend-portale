import React, { useEffect, useMemo, useState } from "react";
import {
  Box, Heading, SimpleGrid, Stat, StatLabel, StatNumber,
  Table, Thead, Tr, Th, Tbody, Td, Button, Select, Input
} from "@chakra-ui/react";
import jsPDF from "jspdf";
import { api } from "../api";

// ---- Tipi minimi, non tocco il tuo styling ----
type Segnalazione = {
  id: number;
  data: string;       // formato gg/mm/aaaa o ISO, la mostri come stringa
  ora: string;        // hh:mm
  categoria?: string; // arriva dalla JOIN
  sala?: string;      // arriva dalla JOIN
  descrizione?: string;
  cliente_id?: number;
  categoria_id?: number;
};

// Normalizza qualunque risposta in un array ([], {rows:[]}, null, 304 ecc.)
function ensureArray<T = any>(raw: any): T[] {
  if (Array.isArray(raw)) return raw as T[];
  if (raw && Array.isArray(raw.rows)) return raw.rows as T[];
  // alcune fetch possono restituire {data: [...]} se avete usato axios direttamente
  if (raw && Array.isArray(raw.data)) return raw.data as T[];
  return [];
}

// CSV semplice senza librerie
function toCSV(headers: string[], rows: (string | number)[][]): string {
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    // doppie virgolette raddoppiate e campo tra doppi apici
    return `"${s.replace(/"/g, '""')}"`;
  };
  return [headers, ...rows].map(r => r.map(esc).join(",")).join("\n");
}

export default function DashboardAdmin() {
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [clienti, setClienti] = useState<any[]>([]);
  const [categorie, setCategorie] = useState<any[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);

  // filtri (lasciati base: adegua ai tuoi controlli esistenti se servisse)
  const [filtroData, setFiltroData] = useState<string>("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("");
  const [filtroCliente, setFiltroCliente] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        // NB: tutte le fetch sono normalizzate per evitare l’errore .map
        const segRaw = (await api.get("/segnalazioni")).data;
        setSegnalazioni(ensureArray<Segnalazione>(segRaw));

        const cliRaw = (await api.get("/clienti")).data;
        setClienti(ensureArray<any>(cliRaw));

        const catRaw = (await api.get("/categorie")).data;
        setCategorie(ensureArray<any>(catRaw));

        const uteRaw = (await api.get("/utenti")).data;
        setUtenti(ensureArray<any>(uteRaw));
      } catch (e) {
        console.error("Errore caricamento dashboard:", e);
        // In caso di errore metto comunque array vuoti per non rompere il render
        setSegnalazioni([]);
        setClienti([]);
        setCategorie([]);
        setUtenti([]);
      }
    })();
  }, []);

  // Applico i filtri senza toccare la sorgente
  const segnalazioniFiltrate = useMemo(() => {
    return segnalazioni
      .filter(s => (filtroData ? (s.data ?? "").includes(filtroData) : true))
      .filter(s => (filtroCategoria ? (s.categoria ?? "") === filtroCategoria : true))
      .filter(s => (filtroCliente ? (s.sala ?? "") === filtroCliente : true));
  }, [segnalazioni, filtroData, filtroCategoria, filtroCliente]);

  // Esporta CSV
  const exportCSV = () => {
    const headers = ["ID", "DATA", "ORA", "CATEGORIA", "SALA", "DESCRIZIONE"];
    const rows = segnalazioniFiltrate.map(s => [
      s.id, s.data ?? "", s.ora ?? "", s.categoria ?? "", s.sala ?? "", s.descrizione ?? ""
    ]);
    const csv = toCSV(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "segnalazioni.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Esporta PDF con sola libreria jspdf (niente autotable)
  const exportPDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;
    let y = 50;

    doc.setFontSize(16);
    doc.text("Segnalazioni", marginX, y);
    y += 20;

    doc.setFontSize(10);
    // header
    doc.text("ID", marginX + 0, y);
    doc.text("Data", marginX + 40, y);
    doc.text("Ora", marginX + 110, y);
    doc.text("Categoria", marginX + 160, y);
    doc.text("Sala", marginX + 300, y);
    doc.text("Descrizione", marginX + 380, y);
    y += 14;

    segnalazioniFiltrate.forEach((s) => {
      // semplice wrap manuale della descrizione
      const desc = (s.descrizione ?? "").replace(/\s+/g, " ");
      const chunk = desc.length > 70 ? desc.slice(0, 70) + "…" : desc;

      if (y > 780) { doc.addPage(); y = 50; }
      doc.text(String(s.id ?? ""), marginX + 0, y);
      doc.text(String(s.data ?? ""), marginX + 40, y);
      doc.text(String(s.ora ?? ""), marginX + 110, y);
      doc.text(String(s.categoria ?? ""), marginX + 160, y);
      doc.text(String(s.sala ?? ""), marginX + 300, y);
      doc.text(chunk, marginX + 380, y);
      y += 14;
    });

    doc.save("segnalazioni.pdf");
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Dashboard Amministratore</Heading>

      {/* Stat cards – lasciamo i numeri come prima */}
      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
        <Stat p={4} borderWidth="1px" rounded="md">
          <StatLabel>Segnalazioni Totali</StatLabel>
          <StatNumber>{segnalazioni.length}</StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" rounded="md">
          <StatLabel>Clienti</StatLabel>
          <StatNumber>{clienti.length}</StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" rounded="md">
          <StatLabel>Categorie</StatLabel>
          <StatNumber>{categorie.length}</StatNumber>
        </Stat>
        <Stat p={4} borderWidth="1px" rounded="md">
          <StatLabel>Utenti</StatLabel>
          <StatNumber>{utenti.length}</StatNumber>
        </Stat>
      </SimpleGrid>

      {/* Filtri – non cambio UX: data, categoria, cliente */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
        <Input
          placeholder="gg/mm/aaaa"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
        <Select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="">Tutte le categorie</option>
          {ensureArray<any>(categorie).map((c: any) => (
            <option key={c.id} value={c.nome_categoria}>{c.nome_categoria}</option>
          ))}
        </Select>
        <Select
          value={filtroCliente}
          onChange={(e) => setFiltroCliente(e.target.value)}
        >
          <option value="">Tutti i clienti</option>
          {ensureArray<any>(clienti).map((cl: any) => (
            <option key={cl.id} value={cl.nome_sala}>{cl.nome_sala}</option>
          ))}
        </Select>
      </SimpleGrid>

      <Table size="sm" variant="simple">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>DATA</Th>
            <Th>ORA</Th>
            <Th>CATEGORIA</Th>
            <Th>SALA</Th>
            <Th>DESCRIZIONE</Th>
          </Tr>
        </Thead>
        <Tbody>
          {segnalazioniFiltrate.map((s) => (
            <Tr key={s.id}>
              <Td>{s.id}</Td>
              <Td>{s.data}</Td>
              <Td>{s.ora}</Td>
              <Td>{s.categoria ?? ""}</Td>
              <Td>{s.sala ?? ""}</Td>
              <Td>{s.descrizione}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Box mt={6} display="flex" gap={3} flexWrap="wrap">
        <Button colorScheme="green" onClick={exportCSV}>Esporta CSV</Button>
        <Button colorScheme="blue" onClick={exportPDF}>Esporta PDF</Button>
        {/* I tuoi tre bottoni esistenti restano qui */}
        {/* <Button>Gestione Utenti</Button>
            <Button>Gestione Categorie</Button>
            <Button>Gestione Clienti</Button> */}
      </Box>
    </Box>
  );
}
