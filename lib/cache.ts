// Sistema de cache en memoria para optimizar lecturas de archivos JSON
// Reduce significativamente el uso de CPU al evitar lecturas repetidas del disco

interface CacheEntry<T> {
  data: T
  timestamp: number
  filePath: string
}

class FileCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly TTL: number = 5000 // 5 segundos por defecto
  private readonly MAX_SIZE: number = 100 // Máximo 100 entradas en cache

  /**
   * Obtiene datos del cache o los carga desde el archivo
   * @param filePath Ruta del archivo
   * @param loader Función que carga los datos desde el archivo
   * @param ttl Tiempo de vida del cache en milisegundos (opcional)
   */
  async get<T>(
    filePath: string,
    loader: () => Promise<T>,
    ttl: number = this.TTL
  ): Promise<T> {
    const key = filePath
    const now = Date.now()
    const entry = this.cache.get(key)

    // Si existe y no ha expirado, devolver del cache
    if (entry && (now - entry.timestamp) < ttl) {
      return entry.data as T
    }

    // Si el cache está lleno, eliminar la entrada más antigua
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictOldest()
    }

    // Cargar datos frescos
    const data = await loader()
    
    // Guardar en cache
    this.cache.set(key, {
      data,
      timestamp: now,
      filePath,
    })

    return data
  }

  /**
   * Invalida el cache para un archivo específico
   */
  invalidate(filePath: string): void {
    this.cache.delete(filePath)
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Elimina la entrada más antigua del cache
   */
  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      entries: Array.from(this.cache.keys()),
    }
  }
}

// Instancia singleton del cache
export const fileCache = new FileCache()

// Función helper para leer archivos JSON con cache
export async function readJsonFileWithCache<T>(
  filePath: string,
  ttl: number = 5000
): Promise<T> {
  const { promises: fs } = await import('fs')
  
  return fileCache.get(
    filePath,
    async () => {
      const contents = await fs.readFile(filePath, 'utf8')
      return JSON.parse(contents) as T
    },
    ttl
  )
}

