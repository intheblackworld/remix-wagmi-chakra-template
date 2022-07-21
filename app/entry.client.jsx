import { useState } from 'react'
import { RemixBrowser } from '@remix-run/react'
import { CacheProvider } from '@emotion/react'
import { hydrate } from 'react-dom'
import { providers } from 'ethers'
import { Provider } from 'wagmi'


import { ClientStyleContext } from './chakra-ui-context/context'
import createEmotionCache from './chakra-ui-context/createEmotionCache'

function ClientCacheProvider({ children }) {
  const [cache, setCache] = useState(createEmotionCache())

  function reset() {
    setCache(createEmotionCache())
  }

  return (
    <ClientStyleContext.Provider value={{ reset }}>
      <CacheProvider value={cache}>{children}</CacheProvider>
    </ClientStyleContext.Provider>
  )
}


const provider = () => {
  return new providers.InfuraProvider(
    process.env.NODE_ENV === 'development' ? 4 : 1,
    window.ENV.INFURA_ID
  )
}

hydrate(
  <Provider provider={provider} autoConnect>
    <ClientCacheProvider></ClientCacheProvider>
    <RemixBrowser />
  </Provider>,
  document
)
