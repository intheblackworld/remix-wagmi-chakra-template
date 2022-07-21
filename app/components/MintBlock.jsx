import { useMemo, useState, useEffect } from 'react'
import { useAccount, useProvider, useWaitForTransaction } from 'wagmi'
import { utils } from 'ethers'

import WAGMINFB from '../abi/wagmi-nfb'
import { mintErrorFormat } from '../utils/errorFormat'
import { readContract, writeContract } from '../utils/contract/helper'

import ConnectorButton from '../components/ConnectorButton'
import { Button } from '@chakra-ui/react'


export default function MintBlock() {
  const provider = useProvider()
  const [isMintSuccess, setIsMintSuccess] = useState(false)
  const [isMintFailed, setIsMintFailed] = useState(false)
  const [{ data: accountData }] = useAccount()

  const [{ data: balanceOfNFT }, readBalanceOf] = readContract({
    method: 'balanceOf',
    provider,
    abi: WAGMINFB,
    args: accountData?.address,
  })

  const [{ data: totalSupply }, readTotalSupply] = readContract({
    method: 'totalSupply',
    provider,
    abi: WAGMINFB,
  })

  const [{ data: mintResponse, error, loading }, mint] = writeContract({
    method: 'mint',
    provider,
    abi: WAGMINFB,
  })

  const [{ data: transactionData, loading: transactionLoading }] =
    useWaitForTransaction({
      hash: mintResponse?.hash,
    })

  useEffect(() => {
    if (transactionLoading) return
    readBalanceOf()
    readTotalSupply()
  }, [accountData?.address, transactionLoading])

  useMemo(() => {
    switch (transactionData?.status) {
      case 0:
        return setIsMintFailed(true)
      case 1:
        return setIsMintSuccess(true)
    }
  }, [transactionData])

  const handleMintNFT = () => {
    setIsMintSuccess(false)
    setIsMintFailed(false)
    if (transactionLoading) return
    mint({
      overrides: {
        value: utils.parseEther('0.03'),
      },
    })
  }

  return (
    <div
      style={{
        backgroundColor: '#ccf',
        padding: 14,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          border: '1px solid #000',
          borderRadius: 4,
          padding: 24,
        }}
      >
        {accountData ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div>
              已擁有：
              {balanceOfNFT
                ? utils.formatUnits(balanceOfNFT, 0)
                : '讀取中'}
            </div>
            <div style={{ marginTop: 20 }}>
              {loading || transactionLoading ? (
                '鑄造中...'
              ) : (
                <Button colorScheme='teal' variant='outline' onClick={handleMintNFT}>進行鑄造</Button>
              )}
            </div>
            {isMintFailed ? (
              <div style={{ marginTop: 20, color: 'green' }}>鑄造失敗!</div>
            ) : null}
            {isMintSuccess ? (
              <div style={{ marginTop: 20, color: 'green' }}>鑄造成功!</div>
            ) : null}
            {error ? (
              <div style={{ marginTop: 20, color: 'red' }}>
                {error ? mintErrorFormat(error) : null}
              </div>
            ) : null}
            <div style={{ marginTop: 20 }}>
              已鑄造總數量：
              {totalSupply ? utils.formatUnits(totalSupply, 0) : '查詢中...'}
            </div>
          </div>
        ) : (
          <div>
            <ConnectorButton customText="請先連接錢包" />
          </div>
        )}
      </div>
    </div>
  )
}
