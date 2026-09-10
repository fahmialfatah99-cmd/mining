interface Props {
  selected: string
  onSelect: (crypto: string) => void
}

const cryptos = [
  { id: 'BTC', name: 'Bitcoin', icon: '₿', color: 'from-orange-400 to-yellow-500', algo: 'SHA-256', reward: '3.125 BTC' },
  { id: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'from-blue-400 to-purple-500', algo: 'Ethash', reward: '2.0 ETH' },
  { id: 'LTC', name: 'Litecoin', icon: 'Ł', color: 'from-gray-300 to-gray-500', algo: 'Scrypt', reward: '6.25 LTC' },
  { id: 'XMR', name: 'Monero', icon: 'ɱ', color: 'from-orange-500 to-red-600', algo: 'RandomX', reward: '0.6 XMR' },
]

export default function CryptoSelector({ selected, onSelect }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">Select Cryptocurrency</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {cryptos.map(crypto => (
          <button
            key={crypto.id}
            onClick={() => onSelect(crypto.id)}
            className={`relative p-4 rounded-lg border-2 transition-all duration-300 text-left ${
              selected === crypto.id
                ? 'border-yellow-400 bg-gray-700/50 shadow-lg shadow-yellow-400/10'
                : 'border-gray-600 hover:border-gray-500 bg-gray-700/20'
            }`}
          >
            {selected === crypto.id && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            )}
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${crypto.color} flex items-center justify-center text-white font-bold text-lg mb-2`}>
              {crypto.icon}
            </div>
            <div className="font-semibold text-white">{crypto.name}</div>
            <div className="text-xs text-gray-400 mt-1">{crypto.algo} | {crypto.reward}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
