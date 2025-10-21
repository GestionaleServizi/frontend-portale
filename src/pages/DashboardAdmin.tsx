// src/pages/DashboardAdmin.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
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
  Input,
  Select,
  useToast,
  Image,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiFolder, FiBriefcase, FiLogOut, FiFileText, FiCalendar } from "react-icons/fi";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria?: string;
  sala?: string;
};

type Categoria = { id: number; nome_categoria: string };
type Cliente = { id: number; nome_sala: string };

type FiltroTemporale = 
  | "oggi" 
  | "ultimi-7-giorni" 
  | "ultimi-30-giorni" 
  | "questo-mese" 
  | "mese-scorso" 
  | "personalizzato" 
  | "tutti";

export default function DashboardAdmin() {
  const { token, logout } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  
  // Nuovi stati per i filtri
  const [filtroTemporale, setFiltroTemporale] = useState<FiltroTemporale>("tutti");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  
  const toast = useToast();
  const nav = useNavigate();

  // Carica dati
  const loadData = async () => {
    try {
      const [segRes, catRes, cliRes, uteRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL}/segnalazioni`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSegnalazioni(await segRes.json());
      setCategorie(await catRes.json());
      setClienti(await cliRes.json());
      setUtenti(await uteRes.json());
    } catch {
      toast({ title: "Errore caricamento dati", status: "error" });
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Calcola le date in base al filtro temporale
  useEffect(() => {
    const oggi = new Date();
    let inizio: Date, fine: Date;

    switch (filtroTemporale) {
      case "oggi":
        inizio = new Date(oggi);
        fine = new Date(oggi);
        break;
      
      case "ultimi-7-giorni":
        inizio = new Date(oggi);
        inizio.setDate(oggi.getDate() - 7);
        fine = new Date(oggi);
        break;
      
      case "ultimi-30-giorni":
        inizio = new Date(oggi);
        inizio.setDate(oggi.getDate() - 30);
        fine = new Date(oggi);
        break;
      
      case "questo-mese":
        inizio = new Date(oggi.getFullYear(), oggi.getMonth(), 1);
        fine = new Date(oggi.getFullYear(), oggi.getMonth() + 1, 0);
        break;
      
      case "mese-scorso":
        inizio = new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1);
        fine = new Date(oggi.getFullYear(), oggi.getMonth(), 0);
        break;
      
      case "personalizzato":
        // L'utente imposterà manualmente dataInizio e dataFine
        return;
      
      case "tutti":
      default:
        setDataInizio("");
        setDataFine("");
        return;
    }

    setDataInizio(inizio.toISOString().split('T')[0]);
    setDataFine(fine.toISOString().split('T')[0]);
  }, [filtroTemporale]);

  // Filtri combinati
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    // Filtro temporale
    const dataSegnalazione = new Date(s.data);
    const dataInizioFilter = dataInizio ? new Date(dataInizio) : null;
    const dataFineFilter = dataFine ? new Date(dataFine) : null;
    
    const dataMatch = 
      (!dataInizioFilter || dataSegnalazione >= dataInizioFilter) &&
      (!dataFineFilter || dataSegnalazione <= dataFineFilter);
    
    // Altri filtri
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    const cliMatch = filtroCliente ? s.sala === filtroCliente : true;
    
    return dataMatch && catMatch && cliMatch;
  });

  // Esporta CSV con i filtri applicati
  const esportaCSV = () => {
    const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
    const rows = segnalazioniFiltrate.map((s) => [
      s.id,
      new Date(s.data).toLocaleDateString("it-IT"),
      s.ora,
      s.categoria || "",
      s.sala || "",
      s.descrizione || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [header, ...rows].map((e) => e.join(";")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    
    // Nome file con info sui filtri
    const nomeFile = `segnalazioni_${filtroTemporale}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute("download", nomeFile);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV esportato",
      description: `Esportate ${segnalazioniFiltrate.length} segnalazioni`,
      status: "success",
    });
  };

  // Reset filtri
  const resetFiltri = () => {
    setFiltroTemporale("tutti");
    setFiltroCategoria("");
    setFiltroCliente("");
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={6}>
      {/* Header con titolo, logo e pulsanti */}
      <Flex align="center" justify="space-between" mb={6}>
        <Heading size="lg">📊 Dashboard Amministratore</Heading>

        <Image src="/servizinet_logo.png" alt="Logo" boxSize="160px" />

        <HStack spacing={3}>
          <Button colorScheme="blue" leftIcon={<FiUsers />} onClick={() => nav("/utenti")}>
            Utenti
          </Button>
          <Button colorScheme="purple" leftIcon={<FiFolder />} onClick={() => nav("/categorie")}>
            Categorie
          </Button>
          <Button colorScheme="teal" leftIcon={<FiBriefcase />} onClick={() => nav("/clienti")}>
            Clienti
          </Button>
          <Button colorScheme="green" leftIcon={<FiFileText />} onClick={esportaCSV}>
            CSV
          </Button>
          <Button colorScheme="red" leftIcon={<FiLogOut />} onClick={logout}>
            Logout
          </Button>
        </HStack>
      </Flex>

      {/* KPI in orizzontale */}
      <HStack spacing={6} mb={6}>
        <Box p={6} bg="white" borderRadius="md" shadow="sm" flex="1">
          <Text fontSize="sm">📊 Segnalazioni</Text>
          <Heading size="lg">{segnalazioniFiltrate.length}</Heading>
          <Text fontSize="xs" color="gray.600">
            {filtroTemporale !== "tutti" && `Filtro: ${filtroTemporale}`}
          </Text>
        </Box>
        <Box p={6} bg="white" borderRadius="md" shadow="sm" flex="1">
          <Text fontSize="sm">🏢 Clienti</Text>
          <Heading size="lg">{clienti.length}</Heading>
        </Box>
        <Box p={6} bg="white" borderRadius="md" shadow="sm" flex="1">
          <Text fontSize="sm">🗂️ Categorie</Text>
          <Heading size="lg">{categorie.length}</Heading>
        </Box>
        <Box p={6} bg="white" borderRadius="md" shadow="sm" flex="1">
          <Text fontSize="sm">👥 Utenti</Text>
          <Heading size="lg">{utenti.length}</Heading>
        </Box>
      </HStack>

      {/* Filtri */}
      <VStack align="stretch" mb={4} spacing={4}>
        {/* Filtri temporali */}
        <HStack spacing={4}>
          <Select
            placeholder="Periodo temporale"
            value={filtroTemporale}
            onChange={(e) => setFiltroTemporale(e.target.value as FiltroTemporale)}
            maxW="300px"
          >
            <option value="tutti">Tutti i periodi</option>
            <option value="oggi">Oggi</option>
            <option value="ultimi-7-giorni">Ultimi 7 giorni</option>
            <option value="ultimi-30-giorni">Ultimi 30 giorni</option>
            <option value="questo-mese">Questo mese</option>
            <option value="mese-scorso">Mese scorso</option>
            <option value="personalizzato">Personalizzato</option>
          </Select>

          {filtroTemporale === "personalizzato" && (
            <>
              <Input
                type="date"
                value={dataInizio}
                onChange={(e) => setDataInizio(e.target.value)}
                placeholder="Data inizio"
              />
              <Text>al</Text>
              <Input
                type="date"
                value={dataFine}
                onChange={(e) => setDataFine(e.target.value)}
                placeholder="Data fine"
              />
            </>
          )}

          {(filtroTemporale !== "tutti" && filtroTemporale !== "personalizzato") && (
            <Text fontSize="sm" color="gray.600">
              {dataInizio && `Dal ${new Date(dataInizio).toLocaleDateString("it-IT")}`}
              {dataFine && ` al ${new Date(dataFine).toLocaleDateString("it-IT")}`}
            </Text>
          )}
        </HStack>

        {/* Filtri per categoria e cliente */}
        <HStack spacing={4}>
          <Select
            placeholder="Tutte le categorie"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            maxW="300px"
          >
            {categorie.map((c) => (
              <option key={c.id} value={c.nome_categoria}>
                {c.nome_categoria}
              </option>
            ))}
          </Select>

          <Select
            placeholder="Tutti i clienti"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            maxW="300px"
          >
            {clienti.map((c) => (
              <option key={c.id} value={c.nome_sala}>
                {c.nome_sala}
              </option>
            ))}
          </Select>

          <Button onClick={resetFiltri} leftIcon={<FiCalendar />}>
            Reset Filtri
          </Button>
        </HStack>
      </VStack>

      {/* Tabella segnalazioni */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <Table>
          <Thead>
            <Tr>
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
    </Flex>
  );
}
