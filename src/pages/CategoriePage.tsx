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
  useDisclosure,
  Image,
} from "@chakra-ui/react";
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

type Categoria = {
  id: number;
  nome_categoria: string;
};

export default function CategoriePage() {
  const { token, logout } = useAuth();
  const [categorie, setCategorie] = useState<Categoria[]>([]);
  const [selected, setSelected] = useState<Categoria | null>(null);
  const [nome, setNome] = useState("");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const loadCategorie = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCategorie(data);
    } catch {
      toast({ title: "Errore caricamento categorie", status: "error" });
    }
  };

  useEffect(() => {
    loadCategorie();
  }, []);

  const handleSave = async () => {
    try {
      const method = selected ? "PUT" : "POST";
      const url = selected
        ? `${import.meta.env.VITE_API_BASE_URL}/categorie/${selected.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/categorie`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome_categoria: nome }),
      });

      if (!res.ok) throw new Error("Errore salvataggio");

      toast({
        title: selected ? "Categoria aggiornata" : "Categoria creata",
        status: "success",
      });
      onClose();
      setSelected(null);
      setNome("");
      loadCategorie();
    } catch {
      toast({ title: "Errore salvataggio", status: "error" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Vuoi davvero eliminare questa categoria?")) return;
    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/categorie/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "Categoria eliminata", status: "info" });
      loadCategorie();
    } catch {
      toast({ title: "Errore eliminazione", status: "error" });
    }
  };

  const openModal = (categoria?: Categoria) => {
    if (categoria) {
      setSelected(categoria);
      setNome(categoria.nome_categoria);
    } else {
      setSelected(null);
      setNome("");
    }
    onOpen();
  };

  return (
    <Flex minH="100vh" bg="gray.50" direction="column" p={8}>
      {/* Header come ClientiPage */}
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">🗂️ Gestione Categorie</Heading>
        <Image
          src="/servizinet_logo.png"
          alt="Logo"
          boxSize="160px"
          objectFit="contain"
        />
        <HStack spacing={4}>
          <Button colorScheme="blue" onClick={() => navigate("/dashboard")}>
            📊 Dashboard
          </Button>
          <Button colorScheme="red" onClick={logout}>
            🚪 Logout
          </Button>
        </HStack>
      </Flex>

      {/* Tabella categorie */}
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <HStack justify="flex-end" mb={4}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="purple"
            onClick={() => openModal()}
          >
            Aggiungi Categoria
          </Button>
        </HStack>

        <Table>
          <Thead>
            <Tr>
              <Th>Nome Categoria</Th>
              <Th>Azioni</Th>
            </Tr>
          </Thead>
          <Tbody>
            {categorie.map((c) => (
              <Tr key={c.id}>
                <Td>{c.id}</Td>
                <Td>{c.nome_categoria}</Td>
                <Td>
                  <HStack>
                    <IconButton
                      aria-label="Modifica"
                      icon={<EditIcon />}
                      size="sm"
                      onClick={() => openModal(c)}
                    />
                    <IconButton
                      aria-label="Elimina"
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      onClick={() => handleDelete(c.id)}
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modale Aggiungi/Modifica Categoria */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selected ? "Modifica Categoria" : "Nuova Categoria"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nome Categoria</FormLabel>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
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
