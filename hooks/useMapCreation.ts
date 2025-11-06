import { useState } from 'react';
import axios from 'axios';

interface MapFormData {
  name: string;
  description: string;
  imageUrl: string;
  imageFile?: File;
}

export function useMapCreation(onSuccess: () => void) {
  const [formData, setFormData] = useState<MapFormData>({
    name: '',
    description: '',
    imageUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      const requestData = {
        name: formData.name,
        description: formData.description,
        imageUrl: formData.imageUrl,
      };

      const response = await axios.post(`${API_URL}/criarMapa`, requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      console.log('Resposta da API:', response.data);

      onSuccess();
    } catch (err) {
      console.error('Erro ao criar mapa:', err);

      if (axios.isAxiosError(err)) {
        if (err.response) {
          setError(`Erro do servidor: ${err.response.data?.message || err.response.statusText}`);
        } else if (err.request) {
          setError('Não foi possível conectar ao servidor. Verifique sua conexão.');
        } else {
          setError('Erro ao preparar requisição.');
        }
      } else {
        setError('Erro inesperado ao criar mapa.');
      }

      setIsSubmitting(false);
    }
  };

  return {
    formData,
    setFormData,
    isSubmitting,
    error,
    handleSubmit,
    handleImageUpload,
  };
}
