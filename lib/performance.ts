// OPTIMIZACIÓN CPU: Utilidad para monitorear y detectar problemas de rendimiento
// Ayuda a identificar componentes lentos y operaciones costosas

/**
 * Mide el tiempo de ejecución de una función y lo reporta si excede un umbral
 * BENEFICIO: Detecta automáticamente renders lentos (>16ms) que causan frames perdidos
 */
export function measureRenderTime(componentName: string, fn: () => void, threshold = 16) {
    const start = performance.now()
    fn()
    const duration = performance.now() - start

    // Si el render tomó más del umbral (16ms = 60fps), reportar
    if (duration > threshold) {
        console.warn(
            `⚠️ SLOW RENDER: ${componentName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
        )
    }

    return duration
}

/**
 * Wrapper para medir el tiempo de funciones asíncronas
 * BENEFICIO: Detecta operaciones de red o I/O lentas
 */
export async function measureAsyncOperation<T>(
    operationName: string,
    fn: () => Promise<T>,
    threshold = 1000
): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start

    if (duration > threshold) {
        console.warn(
            `⚠️ SLOW ASYNC: ${operationName} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`
        )
    }

    return result
}

/**
 * Marca de rendimiento personalizada compatible con Performance API
 * BENEFICIO: Integración con Chrome DevTools Performance tab
 */
export function mark(name: string) {
    if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
        performance.mark(name)
    }
}

/**
 * Mide el tiempo entre dos marcas
 * BENEFICIO: Mide flujos de usuario completos (ej: "click-to-render")
 */
export function measure(name: string, startMark: string, endMark: string) {
    if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
        try {
            performance.measure(name, startMark, endMark)
            const measures = performance.getEntriesByName(name, 'measure')
            if (measures.length > 0) {
                const duration = measures[measures.length - 1].duration
                console.log(`📊 MEASURE: ${name} = ${duration.toFixed(2)}ms`)
                return duration
            }
        } catch (e) {
            console.warn(`Could not measure ${name}:`, e)
        }
    }
    return 0
}

/**
 * Wrapper para React useEffect que mide su tiempo de ejecución
 * BENEFICIO: Detecta efectos secundarios lentos que bloquean el render
 */
export function measureEffect(effectName: string, effect: () => void | (() => void)) {
    return () => {
        const start = performance.now()
        const cleanup = effect()
        const duration = performance.now() - start

        if (duration > 16) {
            console.warn(
                `⚠️ SLOW EFFECT: ${effectName} took ${duration.toFixed(2)}ms`
            )
        }

        return cleanup
    }
}

/**
 * Detecta cuando el FPS cae por debajo del umbral
 * BENEFICIO: Alerta cuando la app no mantiene 60fps
 */
export function monitorFPS(callback: (fps: number) => void, threshold = 55) {
    if (typeof window === 'undefined') return () => { }

    let lastTime = performance.now()
    let frameCount = 0
    let rafId: number

    const checkFPS = () => {
        frameCount++
        const currentTime = performance.now()

        // Calcular FPS cada segundo
        if (currentTime >= lastTime + 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime))

            if (fps < threshold) {
                console.warn(`⚠️ LOW FPS: ${fps} fps (threshold: ${threshold})`)
            }

            callback(fps)

            frameCount = 0
            lastTime = currentTime
        }

        rafId = requestAnimationFrame(checkFPS)
    }

    rafId = requestAnimationFrame(checkFPS)

    // Retornar función de cleanup
    return () => cancelAnimationFrame(rafId)
}

/**
 * Hook de React para medir el tiempo de render de un componente
 * Uso: const renderTime = useRenderTimer('MyComponent')
 */
// Nota: Esta función debe ser importada en un componente React
// import { useState, useEffect } from 'react'
// export function useRenderTimer(componentName: string, threshold = 16) {
//   const [renderTime, setRenderTime] = useState(0)
//
//   useEffect(() => {
//     const duration = performance.now() - (window as any).__renderStart
//     setRenderTime(duration)
//
//     if (duration > threshold) {
//       console.warn(
//         `⚠️ SLOW COMPONENT: ${componentName} rendered in ${duration.toFixed(2)}ms`
//       )
//     }
//   })
//
//   // Marcar inicio del siguiente render
//   ;(window as any).__renderStart = performance.now()
//
//   return renderTime
// }
