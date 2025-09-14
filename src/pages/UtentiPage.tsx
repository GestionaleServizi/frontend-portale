import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  Box,
  Flex,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  HStack,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

type Utente = {
  id: number;
  email: string;
  ruolo: "admin" | "operatore";
  cliente_id?: number | null;
  created_at?: string;
};

type Cliente = {
  id: number;
  nome_sala: string;
};

export default function UtentiPage() {
  const { token } = useAuth();
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [selected, setSelected] = useState<Utente | null>(null);
  const [formData, setFormData] = useState<Partial<Utente> & { password?: string }>({});
  const toast = useToast();

  const { isOpen, onOpen, onClose } = useDisclosure();

  // Carica utenti e clienti
  const loadUtenti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUtenti(data);
    } catch {
      toast({ title: "Errore caricamento utenti", status: "error" });
    }
  };

  const loadClienti = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/clienti`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClienti(data);
    } catch {
      toast({ title: "Errore caricamento clienti", status: "error" });
    }
  };

  useEffect(() => {
    loadUtenti();
    loadClienti();
  }, []);

  const handleSave = async () => {
    try {
      const method = selected ? "PUT" : "POST";
      const url = selected
        ? `${import.meta.env.VITE_API_BASE_URL}/utenti/${selected.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/utenti`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Errore salvataggio");

      toast({
        title: selected ? "Utente aggiornato" : "Utente creato",
        status: "success",
      });
      onClose();
      setSelected(null);
      setFormData({});
      loadUtenti();
    } catch {
      toast({ title: "Errore salvataggio", status: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi davvero eliminare questo utente?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/utenti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Utente eliminato", status: "info" });
      loadUtenti();
    } catch {
      toast({ title: "Errore eliminazione", status: "error" });
    }
  };

  const openModal = (utente?: Utente) => {
    if (utente) {
      setSelected(utente);
      setFormData(utente);
    } else {
      setSelected(null);
      setFormData({});
    }
    onOpen();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      <Heading mb={6}>👥 Gestione Utenti</Heading>

      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <HStack justify="flex-end" mb={4}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => openModal()}
          >
            Aggiungi Utente
          </Button>
        </HStack>

        <Table>
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Email</Th>
              <Th>Ruolo</Th>
              <Th>Cliente</Th>
              <Th>Creato il</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {utenti.map((u) => (
              <Tr key={u.id}>
                <Td>{u.id}</Td>
                <Td>{u.email}</Td>
                <Td>{u.ruolo}</Td>
                <Td>
                  {u.cliente_id
                    ? clienti.find((c) => c.id === u.cliente_id)?.nome_sala
                    : "-"}
                </Td>
                <Td>
                  {u.created_at
                    ? new Date(u.created_at).toLocaleDateString("it-IT")
                    : "-"}
                </Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Modifica"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => openModal(u)}
                    />
                    <IconButton
                      aria-label="Elimina"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(u.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modale Aggiungi/Modifica Utente */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selected ? "Modifica Utente" : "Nuovo Utente"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={formData.email || ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Password {selected && "(lascia vuoto per non cambiare)"}</FormLabel>
              <Input
                type="password"
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Ruolo</FormLabel>
              <Select
                value={formData.ruolo || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ruolo: e.target.value as "admin" | "operatore",
                  })
                }
              >
                <option value="admin">Admin</option>
                <option value="operatore">Operatore</option>
              </Select>
            </FormControl>
            <FormControl mb={3}>
              <FormLabel>Cliente (solo per Operatore)</FormLabel>
              <Select
                placeholder="Nessuno"
                value={formData.cliente_id || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cliente_id: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                {clienti.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome_sala}
                  </option>
                ))}
              </Select>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSave}>
              Salva
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Annulla
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}
