// src/pages/DashboardOperatore.tsx
import React, { useEffect, useState } from "react";
import {
  Box, Flex, Heading, Text, Table, Thead, Tbody, Tr, Th, Td,
  Button, HStack, Select, Input, Textarea, useToast
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria: string;
  created_at: string;
};

type Categoria = { id: number; nome_categoria: string };

export default function DashboardOperatore() {
  const { token, user } = useAuth(); // user contiene info su cliente_id e sala
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [totaleSegnalazioni, setTotaleSegnalazioni] = useState(0);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const pageSize = 100;
  const [form, setForm] = useState({ data: "", ora: "", descrizione: "", categoria_id: "" });
  const toast = useToast();

  const totalePagine = Math.max(1, Math.ceil(totaleSegnalazioni / pageSize));

  // Prepara i parametri per conteggio e tabella, mantenendo coerenti lista e filtri
  const buildSegnalazioniQueryString = (includePagination = false) => {
    const params = new URLSearchParams();

    if (filtroData) {
      params.append("dataInizio", filtroData);
      params.append("dataFine", filtroData);
    }

    if (filtroCategoria) params.append("categoria", filtroCategoria);

    if (includePagination) {
      params.append("limit", String(pageSize));
      params.append("offset", String((paginaCorrente - 1) * pageSize));
    }

    return params.toString();
  };

  const loadCategorie = async () => {
    try {
      const catRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategorie(await catRes.json());
    } catch {
      toast({ title: "Errore caricamento categorie", status: "error" });
    }
  };

  // Carica il numero totale reale delle segnalazioni dell'operatore, applicando i filtri lato backend
  const loadTotaleSegnalazioni = async () => {
    try {
      const queryString = buildSegnalazioniQueryString();
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni/count${queryString ? `?${queryString}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setTotaleSegnalazioni(data.totale || 0);
    } catch {
      toast({ title: "Errore conteggio segnalazioni", status: "error" });
    }
  };

  // Carica le segnalazioni della pagina corrente, applicando gli stessi filtri lato backend
  const loadSegnalazioni = async () => {
    try {
      const queryString = buildSegnalazioniQueryString(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni${queryString ? `?${queryString}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSegnalazioni(await res.json());
    } catch {
      toast({ title: "Errore caricamento segnalazioni", status: "error" });
    }
  };

  // Carica categorie una sola volta
  useEffect(() => {
    loadCategorie();
  }, []);

  // Ricarica conteggio e tabella quando cambiano filtri o pagina
  useEffect(() => {
    loadTotaleSegnalazioni();
    loadSegnalazioni();
  }, [filtroData, filtroCategoria, paginaCorrente]);

  // Invia nuova segnalazione
  const inviaSegnalazione = async () => {
    if (!form.data || !form.ora || !form.descrizione || !form.categoria_id) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast({ title: "Segnalazione inviata", status: "success" });
        setForm({ data: "", ora: "", descrizione: "", categoria_id: "" });
        setPaginaCorrente(1);
        loadTotaleSegnalazioni();
        loadSegnalazioni();
      } else {
        toast({ title: "Errore invio segnalazione", status: "error" });
      }
    } catch {
      toast({ title: "Errore di rete", status: "error" });
    }
  };

  // Export CSV
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Descrizione"];
    const rows = segnalazioni.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria,
      s.descrizione,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(";")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "segnalazioni_operatore.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export PDF (stampa)
  const esportaPDF = () => {
    const printContent = `
      <h2>Le mie Segnalazioni</h2>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead>
          <tr>
            <th>ID</th><th>Data</th><th>Ora</th><th>Categoria</th><th>Descrizione</th>
          </tr>
        </thead>
        <tbody>
          ${segnalazioni
            .map(
              (s) => `
            <tr>
              <td>${s.id}</td>
              <td>${new Date(s.data).toLocaleDateString("it-IT")}</td>
              <td>${s.ora}</td>
              <td>${s.categoria}</td>
              <td>${s.descrizione}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
    const newWin = window.open("", "_blank");
    newWin!.document.write(printContent);
    newWin!.print();
    newWin!.close();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      <Heading mb={6}>📌 Operatore – {user?.nome_sala || "Sala"} </Heading>

      {/* Form segnalazione */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <Heading size="md" mb={4}>Nuova Segnalazione</Heading>
        <HStack spacing={4} mb={3}>
          <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
          <Input type="time" value={form.ora} onChange={(e) => setForm({ ...form, ora: e.target.value })} />
        </HStack>
        <Textarea
          placeholder="Descrizione"
          value={form.descrizione}
          onChange={(e) => setForm({ ...form, descrizione: e.target.value })}
          mb={3}
        />
        <Select
          placeholder="Seleziona categoria"
          value={form.categoria_id}
          onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
          mb={3}
        >
          {categorie.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>
        <Button colorScheme="blue" onClick={inviaSegnalazione}>Invia Segnalazione</Button>
      </Box>

      {/* Filtri */}
      <HStack mb={4} spacing={4}>
        <Input type="date" value={filtroData} onChange={(e) => { setFiltroData(e.target.value); setPaginaCorrente(1); }} />
        <Select
          placeholder="Tutte le categorie"
          value={filtroCategoria}
          onChange={(e) => { setFiltroCategoria(e.target.value); setPaginaCorrente(1); }}
        >
          {categorie.map((c) => (
            <option key={c.id} value={c.nome_categoria}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>
        <Button onClick={() => { setFiltroData(""); setFiltroCategoria(""); setPaginaCorrente(1); }}>Reset</Button>
      </HStack>

      {/* Tabella segnalazioni */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Data</Th>
              <Th>Ora</Th>
              <Th>Categoria</Th>
              <Th>Descrizione</Th>
            </Tr>
          </Thead>
          <Tbody>
            {segnalazioni.map((s) => (
              <Tr key={s.id}>
                <Td>{s.id}</Td>
                <Td>{new Date(s.data).toLocaleDateString("it-IT")}</Td>
                <Td>{s.ora}</Td>
                <Td>{s.categoria}</Td>
                <Td>{s.descrizione}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {totalePagine > 1 && (
          <HStack justify="center" spacing={2} mt={6}>
            <Button
              size="sm"
              variant="outline"
              isDisabled={paginaCorrente === 1}
              onClick={() => setPaginaCorrente((p) => Math.max(1, p - 1))}
            >
              Precedente
            </Button>
            <Text fontSize="sm" color="gray.600">
              Pagina {paginaCorrente} di {totalePagine}
            </Text>
            <Button
              size="sm"
              variant="outline"
              isDisabled={paginaCorrente === totalePagine}
              onClick={() => setPaginaCorrente((p) => Math.min(totalePagine, p + 1))}
            >
              Successiva
            </Button>
          </HStack>
        )}
      </Box>

      {/* Export */}
      <HStack spacing={6} justify="center" mt={4}>
        <Button colorScheme="green" onClick={esportaCSV}>⬇️ CSV</Button>
        <Button colorScheme="blue" onClick={esportaPDF}>⬇️ PDF</Button>
      </HStack>
    </Flex>
  );
}
