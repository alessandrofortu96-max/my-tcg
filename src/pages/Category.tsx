import { useParams, Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { gameNames, typeNames } from '@/lib/mockData';
import { GameType, ProductType } from '@/lib/types';

const Category = () => {
  const { game } = useParams<{ game: string }>();
  const gameType = game as GameType;

  const types: ProductType[] = ['raw', 'graded', 'sealed'];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <section className="border-b border-border bg-premium-gradient">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {gameNames[gameType]}
              </h1>
              <p className="text-lg text-muted-foreground">
                Esplora le carte disponibili dalla mia collezione
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {types.map(type => (
                <Link key={type} to={`/prodotti?game=${gameType}&type=${type}`}>
                  <Card className="group relative overflow-hidden border-border bg-card transition-smooth hover:shadow-medium cursor-pointer p-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-semibold">
                          {typeNames[type]}
                        </h3>
                        <ArrowRight className="h-6 w-6 text-muted-foreground transition-smooth group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {type === 'raw' && 'Carte non gradate in ottime condizioni'}
                        {type === 'graded' && 'Carte certificate PSA, CGC, BGS'}
                        {type === 'sealed' && 'Booster box, Elite Trainer Box e prodotti sigillati'}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Category;
