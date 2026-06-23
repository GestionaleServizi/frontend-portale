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
  VStack,
  Input,
  Select,
  useToast,
  Image,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Icon,
  IconButton,
  InputGroup,
  InputLeftElement,
  Tooltip,
  useColorModeValue,
  keyframes,
  ScaleFade,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiFolder,
  FiBriefcase,
  FiLogOut,
  FiFileText,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiSearch,
  FiBarChart2,
} from "react-icons/fi";

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
  | "tutti"
  | "oggi" 
  | "ultimi-7-giorni" 
  | "ultimi-30-giorni" 
  | "questo-mese" 
  | "mese-scorso" 
  | "personalizzato";

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export default function DashboardAdmin() {
  const { token, logout } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [totaleSegnalazioni, setTotaleSegnalazioni] = useState(0);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [utenti, setUtenti] = useState<any[]>([]);
  
  // Stati per i filtri
  const [filtroTemporale, setFiltroTemporale] = useState<FiltroTemporale>("tutti");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [paginaCorrente, setPaginaCorrente] = useState(1);
  const pageSize = 100;
  
  const toast = useToast();
  const navigate = useNavigate();

  // SFONDO HEADER BIANCO con testo nero
  const headerBg = useColorModeValue("white", "gray.800");

  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Prepara i parametri per conteggio e tabella, mantenendo coerenti card e lista
  const buildSegnalazioniQueryString = (includePagination = false) => {
    const params = new URLSearchParams();

    if (dataInizio) params.append("dataInizio", dataInizio);
    if (dataFine) params.append("dataFine", dataFine);
    if (filtroCategoria) params.append("categoria", filtroCategoria);
    if (filtroCliente) params.append("sala", filtroCliente);
    if (searchTerm) params.append("search", searchTerm);

    if (includePagination) {
      params.append("limit", String(pageSize));
      params.append("offset", String((paginaCorrente - 1) * pageSize));
    }

    return params.toString();
  };

  // Carica il numero totale reale delle segnalazioni, non limitato alle prime 100 righe
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
      toast({
        title: "Errore conteggio segnalazioni",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Carica le segnalazioni della pagina corrente, applicando i filtri lato backend
  const loadSegnalazioni = async () => {
    try {
      const queryString = buildSegnalazioniQueryString(true);
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni${queryString ? `?${queryString}` : ""}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      setSegnalazioni(data);
    } catch {
      toast({
        title: "Errore caricamento segnalazioni",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Carica dati
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catRes, cliRes, uteRes] = await Promise.all([
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

      setCategorie(await catRes.json());
      setClienti(await cliRes.json());
      setUtenti(await uteRes.json());
      await loadTotaleSegnalazioni();
      await loadSegnalazioni();

    } catch {
      toast({ 
        title: "Errore caricamento dati", 
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
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

  useEffect(() => {
    setPaginaCorrente(1);
  }, [dataInizio, dataFine, filtroCategoria, filtroCliente, searchTerm]);

  useEffect(() => {
    if (!token) return;
    loadTotaleSegnalazioni();
    loadSegnalazioni();
  }, [dataInizio, dataFine, filtroCategoria, filtroCliente, searchTerm, paginaCorrente]);

  const totalePagine = Math.max(1, Math.ceil(totaleSegnalazioni / pageSize));
  const segnalazioniFiltrate = segnalazioni;

  // 📌 ESPORTA CSV - Prende TUTTE le segnalazioni (senza paginazione)
  const esportaCSV = async () => {
    setIsLoading(true);
    
    try {
      // Costruisci i parametri dei filtri attuali (SENZA limit e offset)
      const params = new URLSearchParams();
      if (dataInizio) params.append("dataInizio", dataInizio);
      if (dataFine) params.append("dataFine", dataFine);
      if (filtroCategoria) params.append("categoria", filtroCategoria);
      if (filtroCliente) params.append("sala", filtroCliente);
      if (searchTerm) params.append("search", searchTerm);
      
      // Chiamata all'endpoint /tutte che restituisce TUTTE le segnalazioni
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni/tutte?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Errore nel recupero dati");
      }
      
      const tutteSegnalazioni = await res.json();
      
      if (!tutteSegnalazioni || tutteSegnalazioni.length === 0) {
        toast({
          title: "Nessun dato da esportare",
          description: "Con i filtri attuali non ci sono segnalazioni",
          status: "warning",
          duration: 3000,
        });
        setIsLoading(false);
        return;
      }

      // Genera il CSV
      const header = ["ID", "Data", "Ora", "Categoria", "Sala", "Descrizione"];
      const rows = tutteSegnalazioni.map((s: Segnalazione) => [
        s.id,
        new Date(s.data).toLocaleDateString("it-IT"),
        s.ora,
        s.categoria || "",
        s.sala || "",
        s.descrizione || "",
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8," + [header, ...rows].map((e) => e.join(";")).join("\n");
      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", `segnalazioni_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "✅ CSV esportato con successo!",
        description: `${tutteSegnalazioni.length} segnalazioni esportate`,
        status: "success",
        duration: 5000,
      });
      
    } catch (error) {
      console.error("Errore export CSV:", error);
      toast({
        title: "Errore durante l'esportazione",
        description: error instanceof Error ? error.message : "Riprova più tardi",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" position="relative">
      {/* Header - SFONDO BIANCO con testo NERO */}
      <Box bg={headerBg} px={6} py={4} shadow="md" borderBottom="1px" borderColor="gray.200">
        <Flex align="center" justify="space-between">
          <HStack spacing={4}>
            <Image 
              src="/servizinet_logo.png" 
              alt="Logo" 
              boxSize="50px" 
              borderRadius="lg"
            />
            <Box>
              <Heading size="lg" color="gray.800" fontWeight="bold">
                Dashboard Amministratore
              </Heading>
              <Text color="gray.600" fontSize="md" fontWeight="medium">
                Gestione completa del sistema
              </Text>
            </Box>
          </HStack>

          {/* Pulsanti header - STATISTICHE con bordi come Logout */}
          <HStack spacing={6}>
            {/* Utenti */}
            <Box 
              border="2px" 
              borderColor="blue.400"
              borderRadius="lg"
              px={4}
              py={2}
              bg="blue.50"
              textAlign="center"
              minW="100px"
            >
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {utenti.length}
              </Text>
              <Text fontSize="md" color="blue.700" fontWeight="bold">
                Utenti
              </Text>
            </Box>
            
            {/* Clienti */}
            <Box 
              border="2px" 
              borderColor="teal.400"
              borderRadius="lg"
              px={4}
              py={2}
              bg="teal.50"
              textAlign="center"
              minW="100px"
            >
              <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                {clienti.length}
              </Text>
              <Text fontSize="md" color="teal.700" fontWeight="bold">
                Clienti
              </Text>
            </Box>
            
            {/* Categorie */}
            <Box 
              border="2px" 
              borderColor="purple.400"
              borderRadius="lg"
              px={4}
              py={2}
              bg="purple.50"
              textAlign="center"
              minW="100px"
            >
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {categorie.length}
              </Text>
              <Text fontSize="md" color="purple.700" fontWeight="bold">
                Categorie
              </Text>
            </Box>

            {/* Logout */}
            <Button 
              colorScheme="red"
              leftIcon={<FiLogOut />} 
              onClick={logout} 
              variant="outline"
              borderWidth="2px"
              borderColor="red.400"
              fontWeight="bold"
              _hover={{ bg: "red.50" }}
              size="lg"
            >
              Logout
            </Button>
          </HStack>
        </Flex>
      </Box>

      <Box p={6}>
        {/* PRIMA RIGA: Card Segnalazioni + Gestione */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
          {/* Card Segnalazioni */}
          <ScaleFade in={!isLoading} initialScale={0.9}>
            <Card 
              bg={cardBg
