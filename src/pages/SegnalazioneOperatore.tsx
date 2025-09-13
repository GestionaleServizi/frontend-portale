import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  HStack,
  Select,
  Input,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria?: string;
};

type Categoria = { id: number; nome_categoria: string };
type User = { id: number; nome_sala: string; email: string };

export default function SegnalazioneOperatore() {
  const { token, user } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [descrizione, setDescrizione] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const toast = useToast();
  const nav = useNavigate();

  // Carica segnalazioni e categorie
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

  // Inserisci nuova segnalazione
  const inviaSegnalazione = async () => {
    if (!descrizione || !categoriaId) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }
    try {
      const now = new Date();
      const data = now.toISOString().split("T")[0];
      const ora = now.toTimeString().split(" ")[0].slice(0, 5);

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni-operatore`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            data,
            ora,
            descrizione,
            categoria_id: categoriaId,
          }),
        }
      );

      if (res.ok) {
        toast({ title: "Segnalazione inviata", status: "success" });
        setDescrizione("");
        setCategoriaId("");
        loadData();
      } else {
        toast({ title: "Errore invio segnalazione", status: "error" });
      }
    } catch {
      toast({ title: "Errore di rete", status: "error" });
    }
  };

  // Filtro segnalazioni
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    return dataMatch && catMatch;
  });

  // Export CSV
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Descrizione"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria || "",
      s.descrizione || "",
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
      <h2>Segnalazioni</h2>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead>
          <tr><th>ID</th><th>Data</th><th>Ora</th><th>Categoria</th><th>Descrizione</th></tr>
        </thead>
        <tbody>
          ${segnalazioniFiltrate
            .map(
              (s) => `
            <tr>
              <td>${s.id}</td>
              <td>${new Date(s.data).toLocaleDateString("it-IT")}</td>
              <td>${s.ora}</td>
              <td>${s.categoria || ""}</td>
              <td>${s.descrizione || ""}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>`;
    const newWin = window.open("", "_blank");
    newWin!.document.write(printContent);
    newWin!.print();
    newWin!.close();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Logo e intestazione */}
      <Heading mb={6}>📋 Segnalazioni – {user?.nome_sala || "Operatore"}</Heading>

      {/* Form inserimento */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <Heading size="md" mb={4}>
          ➕ Nuova Segnalazione
        </Heading>
        <HStack spacing={4}>
          <Select
            placeholder="Seleziona categoria"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
          >
            {categorie.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome_categoria}
              </option>
            ))}
          </Select>
          <Input
            placeholder="Descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
          />
          <Button colorScheme="blue" onClick={inviaSegnalazione}>
            Invia
          </Button>
        </HStack>
      </Box>

      {/* Filtri */}
      <HStack mb={4} spacing={4}>
        <Input
          type="date"
          value={filtroData}
          onChange={(e) => setFiltroData(e.target.value)}
        />
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
        <Button
          onClick={() => {
            setFiltroData("");
            setFiltroCategoria("");
          }}
        >
          Reset Filtri
        </Button>
      </HStack>

      {/* Tabella storico */}
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
        <Button colorScheme="green" onClick={esportaCSV}>
          ⬇️ Esporta CSV
        </Button>
        <Button colorScheme="blue" onClick={esportaPDF}>
          ⬇️ Esporta PDF
        </Button>
      </HStack>
    </Flex>
  );
}
