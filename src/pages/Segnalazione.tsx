import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Select,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import logo from "/servizinet_logo.png"; // 👈 Assicurati che il logo sia in questa cartella

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria: string;
  sala: string;
};

type Categoria = { id: number; nome_categoria: string };

export default function Segnalazione() {
  const { token, user, logout } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const toast = useToast();
  const nav = useNavigate();

  // 📌 Carica dati segnalazioni + categorie
  const loadData = async () => {
    try {
      const [segRes, catRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
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

  // 📌 Invia nuova segnalazione
  const handleSubmit = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
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
      });

      if (!res.ok) throw new Error("Errore nel salvataggio");
      toast({ title: "Segnalazione inviata", status: "success" });
      setData("");
      setOra("");
      setDescrizione("");
      setCategoriaId("");
      loadData();
    } catch {
      toast({ title: "Errore nel salvataggio", status: "error" });
    }
  };

  // 📌 Filtri lato frontend
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const matchData = filtroData ? s.data.startsWith(filtroData) : true;
    const matchCat = filtroCategoria ? s.categoria === filtroCategoria : true;
    return matchData && matchCat;
  });

  // 📌 Export CSV
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria,
      s.sala,
      s.descrizione,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(";")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "segnalazioni.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 📌 Export PDF (stampa browser)
  const esportaPDF = () => {
    const printContent = `
      <h2>Segnalazioni</h2>
      <table border="1" cellspacing="0" cellpadding="4">
        <thead>
          <tr>
            <th>ID</th><th>Data</th><th>Ora</th>
            <th>Categoria</th><th>Sala</th><th>Descrizione</th>
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
              <td>${s.sala}</td>
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
    <Flex minH="100vh" bg="gray.50" direction="column" align="center" p={8}>
      {/* Logo e intestazione */}
      <Box textAlign="center" mb={6}>
        <img src={logo} alt="Logo" style={{ width: "100px", margin: "0 auto" }} />
        <Heading size="lg" mt={2}>Nuova Segnalazione</Heading>
        <Text mt={2}>👤 {user?.email} | 🏢 {user?.sala || "Sala non disponibile"}</Text>
        <Button mt={2} colorScheme="red" onClick={logout}>Logout</Button>
      </Box>

      {/* Form centrato */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6} width="100%" maxW="600px">
        <VStack spacing={4}>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          <Input type="time" value={ora} onChange={(e) => setOra(e.target.value)} />
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
          <Button colorScheme="blue" onClick={handleSubmit}>
            Invia Segnalazione
          </Button>
        </VStack>
      </Box>

      {/* Filtri e storico */}
      <HStack spacing={4} mb={4}>
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
        <Button onClick={() => { setFiltroData(""); setFiltroCategoria(""); }}>
          Reset Filtri
        </Button>
      </HStack>

      <Box bg="white" p={6} borderRadius="lg" shadow="md" width="100%" maxW="900px">
        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Data</Th>
              <Th>Ora</Th>
              <Th>Categoria</Th>
              <Th>Sala</Th>
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
                <Td>{s.sala}</Td>
                <Td>{s.descrizione}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Export */}
      <HStack spacing={6} mt={4}>
        <Button colorScheme="green" onClick={esportaCSV}>⬇️ Esporta CSV</Button>
        <Button colorScheme="blue" onClick={esportaPDF}>⬇️ Esporta PDF</Button>
      </HStack>
    </Flex>
  );
}
