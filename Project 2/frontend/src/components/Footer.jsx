import { Link } from 'react-router-dom';
import { Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-stellar-500 to-purple-500 flex items-center justify-center font-bold text-white">
                S
              </div>
              <div className="font-bold text-lg gradient-text">Stellar League</div>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              Transparent community sports league dues and prize pool management powered by the
              Stellar blockchain. Every payment is auditable on-chain.
            </p>
          </div>
          <div>
            <div className="font-semibold mb-3 text-slate-200">Platform</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/leagues" className="hover:text-white">Leagues</Link></li>
              <li><Link to="/explorer" className="hover:text-white">Public Ledger</Link></li>
              <li><Link to="/register" className="hover:text-white">Sign up</Link></li>
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-3 text-slate-200">Resources</div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white inline-flex items-center gap-1"
                >
                  Stellar <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://laboratory.stellar.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white inline-flex items-center gap-1"
                >
                  Lab <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white inline-flex items-center gap-1"
                >
                  <Github className="w-3 h-3" /> Source
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-6 text-center text-sm text-slate-500">
          Built with ❤️ on Stellar · Testnet Demo · {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
}
