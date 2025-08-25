interface KeywordConfig {
  keywords: string[];
  matchType: "exact" | "contains" | "starts_with" | "regex";
  caseSensitive?: boolean;
  fuzzyMatch?: boolean;
  fuzzyThreshold?: number;
}

interface KeywordMatchResult {
  matched: boolean;
  matchedKeywords: string[];
  confidence: number;
}

class KeywordService {
  /**
   * Verifica se uma mensagem corresponde às palavras-chave configuradas
   */
  public async matchesKeywords(
    messageText: string,
    config: KeywordConfig
  ): Promise<boolean> {
    if (!messageText || !config?.keywords?.length) {
      return false;
    }

    const result = this.performMatching(messageText, config);
    return result.matched;
  }

  /**
   * Realiza o matching detalhado e retorna informações completas
   */
  public performMatching(
    messageText: string,
    config: KeywordConfig
  ): KeywordMatchResult {
    const {
      keywords,
      matchType = "contains",
      caseSensitive = false,
      fuzzyMatch = false,
      fuzzyThreshold = 0.8
    } = config;

    let text = messageText;
    let keywordList = keywords;

    // Normaliza case se não for case-sensitive
    if (!caseSensitive) {
      text = text.toLowerCase();
      keywordList = keywords.map(k => k.toLowerCase());
    }

    // Remove acentos para melhor matching
    text = this.removeAccents(text);
    keywordList = keywordList.map(k => this.removeAccents(k));

    const matchedKeywords: string[] = [];
    let totalConfidence = 0;

    for (const keyword of keywordList) {
      const match = this.matchKeyword(text, keyword, matchType, fuzzyMatch, fuzzyThreshold);
      
      if (match.matched) {
        matchedKeywords.push(keywords[keywordList.indexOf(keyword)]); // Mantém keyword original
        totalConfidence += match.confidence;
      }
    }

    return {
      matched: matchedKeywords.length > 0,
      matchedKeywords,
      confidence: matchedKeywords.length > 0 ? totalConfidence / matchedKeywords.length : 0
    };
  }

  /**
   * Faz matching de uma palavra-chave específica
   */
  private matchKeyword(
    text: string,
    keyword: string,
    matchType: string,
    fuzzyMatch: boolean,
    fuzzyThreshold: number
  ): { matched: boolean; confidence: number } {
    let matched = false;
    let confidence = 0;

    switch (matchType) {
      case "exact":
        matched = text.trim() === keyword.trim();
        confidence = matched ? 1.0 : 0;
        break;

      case "contains":
        matched = text.includes(keyword);
        confidence = matched ? 1.0 : 0;
        break;

      case "starts_with":
        matched = text.startsWith(keyword);
        confidence = matched ? 1.0 : 0;
        break;

      case "regex":
        try {
          const regex = new RegExp(keyword, "i");
          matched = regex.test(text);
          confidence = matched ? 1.0 : 0;
        } catch (error) {
          console.error("Regex inválido:", keyword, error);
          matched = false;
          confidence = 0;
        }
        break;
    }

    // Se não houve match exato e fuzzy match está habilitado
    if (!matched && fuzzyMatch) {
      const similarity = this.calculateSimilarity(text, keyword);
      if (similarity >= fuzzyThreshold) {
        matched = true;
        confidence = similarity;
      }
    }

    return { matched, confidence };
  }

  /**
   * Calcula similaridade entre duas strings usando algoritmo de Levenshtein
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const matrix: number[][] = [];
    const len1 = str1.length;
    const len2 = str2.length;

    // Inicializa matriz
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Calcula distâncias
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,     // deletion
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    
    return maxLen === 0 ? 1 : (maxLen - distance) / maxLen;
  }

  /**
   * Remove acentos de uma string
   */
  private removeAccents(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  /**
   * Extrai palavras-chave de uma mensagem (útil para análise)
   */
  public extractKeywords(text: string, minLength: number = 3): string[] {
    if (!text) return [];

    // Remove pontuação e divide em palavras
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length >= minLength);

    // Remove palavras comuns (stop words)
    const stopWords = [
      "a", "o", "e", "de", "da", "do", "para", "com", "em", "por", "um", "uma",
      "que", "se", "na", "no", "não", "mais", "como", "muito", "você", "eu",
      "ele", "ela", "isso", "este", "esta", "são", "foi", "ter", "mas", "já",
      "ou", "quando", "onde", "porque", "qual", "quem", "sobre", "depois",
      "antes", "durante", "sem", "até", "entre", "contra", "através", "sob"
    ];

    return words.filter(word => !stopWords.includes(word));
  }

  /**
   * Sugere palavras-chave baseado em mensagens históricas
   */
  public async suggestKeywords(messages: string[]): Promise<string[]> {
    const allKeywords: string[] = [];

    // Extrai palavras-chave de todas as mensagens
    for (const message of messages) {
      const keywords = this.extractKeywords(message);
      allKeywords.push(...keywords);
    }

    // Conta frequência das palavras
    const frequency: { [key: string]: number } = {};
    for (const keyword of allKeywords) {
      frequency[keyword] = (frequency[keyword] || 0) + 1;
    }

    // Ordena por frequência e retorna as mais comuns
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20) // Top 20
      .map(([keyword]) => keyword);
  }

  /**
   * Testa múltiplas configurações de keywords em uma mensagem
   */
  public testKeywordConfigs(
    messageText: string,
    configs: KeywordConfig[]
  ): { config: KeywordConfig; result: KeywordMatchResult }[] {
    return configs.map(config => ({
      config,
      result: this.performMatching(messageText, config)
    }));
  }

  /**
   * Valida configuração de keywords
   */
  public validateConfig(config: KeywordConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config.keywords || !Array.isArray(config.keywords)) {
      errors.push("Keywords deve ser um array");
    } else if (config.keywords.length === 0) {
      errors.push("Pelo menos uma keyword deve ser fornecida");
    }

    if (config.matchType && !["exact", "contains", "starts_with", "regex"].includes(config.matchType)) {
      errors.push("matchType deve ser: exact, contains, starts_with ou regex");
    }

    if (config.fuzzyThreshold && (config.fuzzyThreshold < 0 || config.fuzzyThreshold > 1)) {
      errors.push("fuzzyThreshold deve estar entre 0 e 1");
    }

    // Valida regexes se o tipo for regex
    if (config.matchType === "regex") {
      for (const keyword of config.keywords || []) {
        try {
          new RegExp(keyword);
        } catch (error) {
          errors.push(`Regex inválido: ${keyword}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export default new KeywordService();