import { EXTERNAL_LINKS } from '@/constants'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and brand */}
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">🌾</span>
            </div>
            <span className="font-semibold text-gray-900">Farm 3.0</span>
          </div>

          {/* Links */}
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <a
              href={EXTERNAL_LINKS.monadWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              Monad
            </a>
            <a
              href={EXTERNAL_LINKS.monadExplorer}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              区块浏览器
            </a>
            <a
              href={EXTERNAL_LINKS.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              文档
            </a>
            <a
              href={EXTERNAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary-600 transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* Copyright */}
          <div className="text-sm text-gray-500">
            © {currentYear} Farm 3.0. Built on Monad.
          </div>
        </div>

        {/* Network info */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-center text-xs text-gray-400">
            <p className="flex items-center justify-center space-x-4">
              <span>🔗 Monad Testnet</span>
              <span>•</span>
              <span>Chain ID: 10143</span>
              <span>•</span>
              <span className="text-green-500">● 在线</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}