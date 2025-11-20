import React from 'react';
import Hero from './components/Hero';
import ModelList from './components/ModelList';
import { useAppOutletContext } from '../../router';

const Home: React.FC = () => {
  const { t } = useAppOutletContext();
  
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