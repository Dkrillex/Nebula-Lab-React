import React from 'react';
import Hero from '../Home/components/Hero';
import ModelList from '../Home/components/ModelList';
import StatsRow from '../Home/components/StatsRow';
import { useAppOutletContext } from '@/router/context';

const ModelsIntroPage: React.FC = () => {
  const { t } = useAppOutletContext();
  
  return (
    <>
      <Hero t={t.hero} />
      <StatsRow />
      <div id="trending-models" className="relative z-10 mt-8">
        <ModelList t={t.modelList} />
      </div>
    </>
  );
};

export default ModelsIntroPage;
