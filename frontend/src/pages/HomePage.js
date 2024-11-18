import React, { useState, useEffect, useCallback } from 'react';
import './HomePage.css';

const HomePage = () => {
  // Crie um estado para armazenar as imagens embaralhadas
  const [shuffledImages, setShuffledImages] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Função para embaralhar as imagens
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  // Função para pegar as primeiras imagens (9 ou 3 no mobile), memorizada com useCallback
  const getImages = useCallback((images, isMobile) => {
    const shuffled = shuffleArray(images);
    return isMobile ? shuffled.slice(0, 3) : shuffled.slice(0, 9); // Exibe 3 no mobile, 9 no desktop
  }, []);

  useEffect(() => {
    // Gere uma lista de caminhos de imagem com base nos nomes de arquivos
    const images = Array.from({ length: 17 }, (_, i) => `/images/${(i + 1).toString().padStart(2, '0')}.jpg`);

    // Verifique se a tela é mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 480); // Define se é mobile ou não
    };

    // Adiciona um event listener para mudar quando a tela for redimensionada
    window.addEventListener('resize', checkIsMobile);
    checkIsMobile(); // Checa no primeiro render

    // Embaralhe e pegue as primeiras imagens
    setShuffledImages(getImages(images, isMobile));

    // Atualizar a grade de imagens a cada 10 segundos (opcional)
    const interval = setInterval(() => {
      setShuffledImages(getImages(images, isMobile));
    }, 10000); // Troca as imagens a cada 10 segundos

    return () => {
      clearInterval(interval); // Limpa o intervalo ao desmontar o componente
      window.removeEventListener('resize', checkIsMobile); // Remove o listener
    };
  }, [isMobile, getImages]); // Agora a dependência de getImages está resolvida

  return (
    <div className="homepage">
      <h1>Bem-vindo à Barbearia</h1>
      <p>Confira os nossos barbeiros e serviços.</p>
      <div className="image-grid">
        {shuffledImages.map((image, index) => (
          <img key={index} src={image} alt={`Barbearia ${index + 1}`} className="barber-image" />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
