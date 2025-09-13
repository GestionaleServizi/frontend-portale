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
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [form, setForm] = useState({ data: "", ora: "", descrizione: "", categoria_id: "" });
  const toast = useToast();

  // Carica categorie e segnalazioni operatore
  const loadData = async () => {
    try {
      const [segRes, catRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni-operatore`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSegnalazioni(await segRes.json());
      setCategorie(await catRes.json());
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtri
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    return dataMatch && catMatch;
  });

  // Invia nuova segnalazione
  const inviaSegnalazione = async () => {
    if (!form.data || !form.ora || !form.descrizione || !form.categoria_id) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni-operatore`, {
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
        loadData();
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
    const rows = segnalazioniFiltrate.map((s) => [
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
          ${segnalazioniFiltrate
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
        <Input type="date" value={filtroData} onChange={(e) => setFiltroData(e.target.value)} />
        <Select
          placeholder="Tutte le categorie"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          {categorie.map((c) => (
            <option key={c.id} value={c.nome_categoria}>
              {c.nome_categoria}
            </option>
          ))}
        </Select>
        <Button onClick={() => { setFiltroData(""); setFiltroCategoria(""); }}>Reset</Button>
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
            {segnalazioniFiltrate.map((s) => (
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
      </Box>

      {/* Export */}
      <HStack spacing={6} justify="center" mt={4}>
        <Button colorScheme="green" onClick={esportaCSV}>⬇️ CSV</Button>
        <Button colorScheme="blue" onClick={esportaPDF}>⬇️ PDF</Button>
      </HStack>
    </Flex>
  );
}
