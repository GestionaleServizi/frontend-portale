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
  VStack,
  Textarea,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { useAuth } from "../hooks/useAuth";

type Segnalazione = {
  id: number;
  data: string;
  ora: string;
  descrizione: string;
  categoria?: string;
};

type Categoria = { id: number; nome_categoria: string };

export default function SegnalazioneOperatore() {
  const { token, user } = useAuth();
  const [segnalazioni, setSegnalazioni] = useState<Segnalazione[]>([]);
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [data, setData] = useState("");
  const [ora, setOra] = useState("");
  const [descrizione, setDescrizione] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  
  // Campi specifici per CONTROLLI FFOO
  const [oraControllo, setOraControllo] = useState("");
  const [numeroAgenti, setNumeroAgenti] = useState("");
  const [personeControllate, setPersoneControllate] = useState("");
  const [attivitaBloccata, setAttivitaBloccata] = useState("NO");
  const [contestazioni, setContestazioni] = useState("NO");
  const [richiesteStruttura, setRichiesteStruttura] = useState("");
  const [verbaliRilasciati, setVerbaliRilasciati] = useState("NO");
  
  const [showCampiFFOO, setShowCampiFFOO] = useState(false);
  const [nomeCategoriaSelezionata, setNomeCategoriaSelezionata] = useState("");
  
  const [filtroData, setFiltroData] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const toast = useToast();

  // Imposta data e ora corrente automaticamente al caricamento
  useEffect(() => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    setData(currentDate);
    setOra(currentTime);
    
    // Imposta ora controllo con ora corrente
    setOraControllo(currentTime);
  }, []);

  // 📌 Carica segnalazioni e categorie
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

  // Gestione cambio categoria
  const handleCategoriaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoriaId = e.target.value;
    setCategoriaId(categoriaId);
    
    // Trova il nome della categoria selezionata
    const categoriaSelezionata = categorie.find(c => c.id.toString() === categoriaId);
    const nomeCategoria = categoriaSelezionata?.nome_categoria || "";
    setNomeCategoriaSelezionata(nomeCategoria);
    
    // Mostra/nascondi campi FFOO
    const isFFOO = nomeCategoria === "CONTROLLI FFOO";
    setShowCampiFFOO(isFFOO);
    
    // Resetta i campi FFOO se si cambia categoria
    if (!isFFOO) {
      setOraControllo("");
      setNumeroAgenti("");
      setPersoneControllate("");
      setAttivitaBloccata("NO");
      setContestazioni("NO");
      setRichiesteStruttura("");
      setVerbaliRilasciati("NO");
    }
  };

  // 📌 Inserisci nuova segnalazione
  const handleSubmit = async () => {
    if (!data || !ora || !descrizione || !categoriaId) {
      toast({ title: "Compila tutti i campi", status: "warning" });
      return;
    }
    
    try {
      // Prepara i dati da inviare
      const payload: any = {
        data,
        ora,
        descrizione,
        cliente_id: user?.id, // 📌 prende l'ID dell'utente loggato
        categoria_id: categoriaId,
      };

      // Aggiungi campi FFOO solo se è CONTROLLI FFOO
      if (nomeCategoriaSelezionata === "CONTROLLI FFOO") {
        payload.ora_controllo = oraControllo;
        payload.numero_agenti = numeroAgenti;
        payload.persone_controllate = personeControllate;
        payload.attivita_bloccata = attivitaBloccata;
        payload.contestazioni = contestazioni;
        payload.richieste_struttura = richiesteStruttura;
        payload.verbali_rilasciati = verbaliRilasciati;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/segnalazioni`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      
      if (!res.ok) throw new Error("Errore inserimento");
      
      toast({ 
        title: "Segnalazione inserita", 
        status: "success",
        description: nomeCategoriaSelezionata === "CONTROLLI FFOO" 
          ? "Inclusi dettagli controllo FFOO" 
          : "Segnalazione registrata"
      });
      
      // Reset form
      setDescrizione("");
      setCategoriaId("");
      setOraControllo("");
      setNumeroAgenti("");
      setPersoneControllate("");
      setAttivitaBloccata("NO");
      setContestazioni("NO");
      setRichiesteStruttura("");
      setVerbaliRilasciati("NO");
      setShowCampiFFOO(false);
      setNomeCategoriaSelezionata("");
      
      // Reimposta data e ora corrente
      const now = new Date();
      setData(now.toISOString().split('T')[0]);
      setOra(now.toTimeString().slice(0, 5));
      setOraControllo(now.toTimeString().slice(0, 5));
      
      loadData();
    } catch {
      toast({ title: "Errore inserimento segnalazione", status: "error" });
    }
  };

  // 📌 Filtri
  const segnalazioniFiltrate = segnalazioni.filter((s) => {
    const dataMatch = filtroData ? s.data.startsWith(filtroData) : true;
    const catMatch = filtroCategoria ? s.categoria === filtroCategoria : true;
    return dataMatch && catMatch;
  });

  // 📌 Export CSV
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

  // 📌 Export PDF (usa stampa nativa browser)
  const esportaPDF = () => {
    const printContent = `
      <h2>Le mie segnalazioni</h2>
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
              <td>${s.categoria || ""}</td>
              <td>${s.descrizione || ""}</td>
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
      <Heading mb={6}>📌 Segnalazioni - {user?.nome_sala}</Heading>

      {/* Form inserimento */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md" mb={6}>
        <Heading size="md" mb={4}>
          ➕ Inserisci segnalazione
        </Heading>
        
        <VStack spacing={4} align="stretch">
          {/* Campi base */}
          <HStack spacing={4} mb={4}>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
            <Input
              type="time"
              value={ora}
              onChange={(e) => setOra(e.target.value)}
            />
            <Select
              placeholder="Seleziona categoria"
              value={categoriaId}
              onChange={handleCategoriaChange}
            >
              {categorie.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_categoria}
                </option>
              ))}
            </Select>
          </HStack>
          
          {/* Descrizione */}
          <Textarea
            placeholder="Descrizione"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            mb={4}
            rows={3}
          />

          {/* Campi CONTROLLI FFOO (visibili solo se categoria selezionata = CONTROLLI FFOO) */}
          {showCampiFFOO && (
            <Box 
              borderWidth="1px" 
              borderRadius="md" 
              p={4} 
              bg="blue.50" 
              borderColor="blue.200"
              mb={4}
            >
              <Heading size="sm" mb={3} color="blue.700">
                👮 DETTAGLI CONTROLLO FFOO
              </Heading>
              
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                {/* Ora controllo */}
                <FormControl>
                  <FormLabel>🕒 Ora del controllo</FormLabel>
                  <Input
                    type="time"
                    value={oraControllo}
                    onChange={(e) => setOraControllo(e.target.value)}
                    placeholder="HH:MM"
                  />
                </FormControl>

                {/* Numero agenti */}
                <FormControl>
                  <FormLabel>👮 Numero agenti</FormLabel>
                  <Input
                    type="number"
                    value={numeroAgenti}
                    onChange={(e) => setNumeroAgenti(e.target.value)}
                    placeholder="Es. 2"
                    min="0"
                  />
                </FormControl>

                {/* Persone controllate */}
                <FormControl>
                  <FormLabel>👥 Persone controllate</FormLabel>
                  <Input
                    type="number"
                    value={personeControllate}
                    onChange={(e) => setPersoneControllate(e.target.value)}
                    placeholder="Es. 5"
                    min="0"
                  />
                </FormControl>

                {/* Attività bloccata */}
                <FormControl>
                  <FormLabel>🛑 Hanno bloccato l'attività?</FormLabel>
                  <Select
                    value={attivitaBloccata}
                    onChange={(e) => setAttivitaBloccata(e.target.value)}
                  >
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </Select>
                </FormControl>

                {/* Contestazioni */}
                <FormControl>
                  <FormLabel>⚖️ Ci sono state contestazioni?</FormLabel>
                  <Select
                    value={contestazioni}
                    onChange={(e) => setContestazioni(e.target.value)}
                  >
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </Select>
                </FormControl>

                {/* Verbali rilasciati */}
                <FormControl>
                  <FormLabel>📄 Sono stati rilasciati Verbali?</FormLabel>
                  <Select
                    value={verbaliRilasciati}
                    onChange={(e) => setVerbaliRilasciati(e.target.value)}
                  >
                    <option value="SI">SI</option>
                    <option value="NO">NO</option>
                  </Select>
                </FormControl>
              </Grid>

              {/* Richieste struttura */}
              <FormControl mt={4}>
                <FormLabel>
                  🏛️ Se i controlli riguardano la struttura specificare le richieste fatte
                </FormLabel>
                <Textarea
                  value={richiesteStruttura}
                  onChange={(e) => setRichiesteStruttura(e.target.value)}
                  placeholder="Descrivi eventuali richieste specifiche..."
                  rows={2}
                />
              </FormControl>
              
              <Text fontSize="sm" color="gray.600" mt={2}>
                ⓘ Questi campi saranno inclusi automaticamente nella descrizione
              </Text>
            </Box>
          )}

          <Button colorScheme="blue" onClick={handleSubmit}>
            {showCampiFFOO ? "📝 Inserisci Segnalazione FFOO" : "Inserisci Segnalazione"}
          </Button>
        </VStack>
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
                <Td whiteSpace="pre-wrap">{s.descrizione}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Bottoni Export */}
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
