import React from 'react';
import Hero from './components/Hero';
import ModelList from './components/ModelList';
import StatsRow from './components/StatsRow';
import HomeFooter from './components/HomeFooter';
import { useAppOutletContext } from '../../router';

const Home: React.FC = () => {
  const { t } = useAppOutletContext();
  
  return (
    <>
      <Hero t={t.hero} />
      <StatsRow />
      <div id="trending-models" className="relative z-10 -mt-8">
         <ModelList t={t.modelList} />
      </div>
      <HomeFooter />
    </>
  );
};

export default Home;
