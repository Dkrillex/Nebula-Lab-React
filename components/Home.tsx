
import React from 'react';
import Hero from './Hero';
import ModelList from './ModelList';

interface HomeProps {
  t: {
    hero: any;
    modelList: any;
  }
}

const Home: React.FC<HomeProps> = ({ t }) => {
  return (
    <>
      <Hero t={t.hero} />
      <div className="relative z-10 -mt-8">
         <ModelList t={t.modelList} />
      </div>
    </>
  );
};

export default Home;
    