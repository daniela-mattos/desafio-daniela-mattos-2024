class RecintosZoo {

  constructor() {
    this.animaisHabilitados = {
      'LEAO': { tamanhoOcupado: 3, biomaAdequado: ['savana'], carnivoro: true },
      'LEOPARDO': { tamanhoOcupado: 2, biomaAdequado: ['savana'], carnivoro: true },
      'CROCODILO': { tamanhoOcupado: 3, biomaAdequado: ['rio'], carnivoro: true },
      'MACACO': { tamanhoOcupado: 1, biomaAdequado: ['savana', 'floresta'], carnivoro: false },
      'GAZELA': { tamanhoOcupado: 2, biomaAdequado: ['savana'], carnivoro: false },
      'HIPOPOTAMO': { tamanhoOcupado: 4, biomaAdequado: ['savana', 'rio'], carnivoro: false }
    };

    this.recintos = [
      { numero: 1, bioma: 'savana', tamanhoTotal: 10, animaisContidos: [{ especie: 'MACACO', quantidade: 3, tamanho: 1 }] },
      { numero: 2, bioma: 'floresta', tamanhoTotal: 5, animaisContidos: [] },
      { numero: 3, bioma: 'savana e rio', tamanhoTotal: 7, animaisContidos: [{ especie: 'GAZELA', quantidade: 1, tamanho: 2 }] },
      { numero: 4, bioma: 'rio', tamanhoTotal: 8, animaisContidos: [] },
      { numero: 5, bioma: 'savana', tamanhoTotal: 9, animaisContidos: [{ especie: 'LEAO', quantidade: 1, tamanho: 3 }] },
    ];
  }

  // Verifica se o bioma do recinto é compatível com o animal
  verificaBioma(recinto, animal) {
    const biomasRecinto = recinto.bioma.split(' e ');
    return biomasRecinto.some(bioma => this.animaisHabilitados[animal].biomaAdequado.includes(bioma));
  }

  // Calcula o espaço disponível no recinto
  calculaEspacoDisponivel(recinto) {
    const espacoOcupado = recinto.animaisContidos.reduce((total, animal) => {
      const espacoAnimal = animal.quantidade * this.animaisHabilitados[animal.especie].tamanhoOcupado;
      return total + espacoAnimal;
    }, 0);
    return recinto.tamanhoTotal - espacoOcupado;
  }

  // Verifica se há carnívoros no recinto
  haCarnivoro(recinto) {
    return recinto.animaisContidos.some(animal => this.animaisHabilitados[animal.especie].carnivoro);
  }

  // Verifica se o recinto contém a mesma espécie (para carnívoros)
  contemMesmaEspecie(recinto, animal) {
    return recinto.animaisContidos.some(a => a.especie === animal);
  }

  // Verifica se há pelo menos uma espécie não carnívora para o macaco ficar junto
  haEspecieNaoCarnivora(recinto) {
    return recinto.animaisContidos.some(a => !this.animaisHabilitados[a.especie].carnivoro);
  }

  // Verifica se o recinto é savana e rio, necessário para o hipopótamo coabitar com outra espécie
  ehSavanaERio(recinto) {
    return recinto.bioma === 'savana e rio';
  }

  // Lógica principal para encontrar recintos viáveis
  analisaRecintos(animal, quantidade) {
    if (!this.animaisHabilitados[animal]) {
      return { erro: 'Animal inválido', recintosViaveis: null };
    }

    if (quantidade <= 0) {
      return { erro: 'Quantidade inválida', recintosViaveis: null };
    }

    const resultado = this.recintos.filter(recinto => {
      const espacoDisponivel = this.calculaEspacoDisponivel(recinto);

      // Verifica se o bioma é compatível e se há espaço suficiente
      if (!this.verificaBioma(recinto, animal) || espacoDisponivel < (quantidade * this.animaisHabilitados[animal].tamanhoOcupado)) {
        return false;
      }

      // Lógica para carnívoros
      if (this.animaisHabilitados[animal].carnivoro) {
        return this.contemMesmaEspecie(recinto, animal) || recinto.animaisContidos.length === 0;
      }

      // Encontra recinto para macacos
      if (animal === 'MACACO') {
        if (quantidade === 1) {
          return this.haEspecieNaoCarnivora(recinto);
        } else {
          return !this.haCarnivoro(recinto);
        }
      }

      // Encontra recinto para hipopótamos
      if (animal === 'HIPOPOTAMO') {
        return recinto.animaisContidos.length === 0 || this.ehSavanaERio(recinto);
      }

      // Encontra recinto para demais herbívoros
      return !this.haCarnivoro(recinto);
    });

    if (resultado.length === 0) {
      return { erro: 'Não há recinto viável', recintosViaveis: null };
    }

    const recintosViaveis = resultado.map(recinto => {
      // Calcula o espaço disponível atual
      let espacoOcupadoAtual = this.calculaEspacoDisponivel(recinto);
      
      // Subtrai o espaço que será ocupado pelos novos animais
      let espacoDisponivelAposAdicao;
      const recintoTemEspecieDiferente = recinto.animaisContidos.some(a => a.especie !== animal);

      // Subtrai espaço extra se tiver outro herbívoro no recinto
      if (recintoTemEspecieDiferente) {
        espacoOcupadoAtual = espacoOcupadoAtual - 1;
        espacoDisponivelAposAdicao = espacoOcupadoAtual - (quantidade * this.animaisHabilitados[animal].tamanhoOcupado);
      } else {
        espacoDisponivelAposAdicao = espacoOcupadoAtual - (quantidade * this.animaisHabilitados[animal].tamanhoOcupado);
      }
      
      // Verifica se o espaço restante é suficiente
      if (espacoDisponivelAposAdicao < 0) {
        return false; // Se não houver espaço suficiente, descarta o recinto
      }
      
      // Retorna a string com o recinto e o espaço livre após a adição
      return `Recinto ${recinto.numero} (espaço livre: ${espacoDisponivelAposAdicao} total: ${recinto.tamanhoTotal})`;
      
    });
    
    

    return { erro: null, recintosViaveis };
  }
}

export { RecintosZoo };
