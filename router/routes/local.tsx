import React from 'react';
import { AppRouteObject } from '../AuthGuard';
import DashboardLayout from '../../components/DashboardLayout';
import { RouteWrapper } from '../../components/RouteWrapper';

// import CreateHome from '../../pages/Create/CreateHome';

// 懒加载组件
const CreateLayout = React.lazy(() => import('../../pages/Create'));
const CreateHome = React.lazy(() => import('../../pages/Create/CreateHome'));
const AssetsPage = React.lazy(() => import('../../pages/Assets'));
const ChatPage = React.lazy(() => import('../../pages/Chat'));
const KeysPage = React.lazy(() => import('../../pages/Keys'));
const ModelSquarePage = React.lazy(() => import('../../pages/Models'));
const ExpensesPage = React.lazy(() => import('../../pages/Expenses'));
const PricingPage = React.lazy(() => import('../../pages/Pricing'));
const PriceListPage = React.lazy(() => import('../../pages/PriceList'));
const ProfilePage = React.lazy(() => import('../../pages/Profile'));

const RankPage = React.lazy(() => import('../../pages/Rank'));

// Create Page Sub-components
const TextToImagePage = React.lazy(() => import('../../pages/Create/components/TextToImagePage'));
const ViralVideoPage = React.lazy(() => import('../../pages/Create/components/ViralVideoPage'));
const ImageToVideoPage = React.lazy(() => import('../../pages/Create/components/ImageToVideoPage'));
const DigitalHumanPage = React.lazy(() => import('../../pages/Create/components/DigitalHumanPage'));
const StyleTransferPage = React.lazy(() => import('../../pages/Create/components/StyleTransferPage'));
const VoiceClone = React.lazy(() => import('../../pages/Create/components/VoiceClone'));
const ThreeDModelPage = React.lazy(() => import('../../pages/Create/components/ThreeDModelPage'));
const GlbViewerPage = React.lazy(() => import('../../pages/Create/components/GlbViewerPage'));
const AiFaceSwapPage = React.lazy(() => import('../../pages/Create/components/AiFaceSwapPage'));
const TtsPage = React.lazy(() => import('../../pages/Create/components/TtsPage'));
const UseToolPage = React.lazy(() => import('../../pages/Create/components/UseToolPage'));
const AIFaceSwappingPage = React.lazy(() => import('../../pages/Create/components/AIFaceSwappingPage'));
const TemplateUiPage = React.lazy(() => import('../../pages/Create/components/TemplateUiPage'));
const WorkshopPage = React.lazy(() => import('../../pages/Create/components/WorkshopPage'));

// Wrapper components defined inline or imported if complex logic needed
// For now, we assume components can handle their own data fetching or use hooks

export const localRoutes: AppRouteObject[] = [
  {
    element: <DashboardLayout />,
    children: [
      {
        path: 'create',
        element: <RouteWrapper component={CreateLayout} translationKey="createPage" />,
        meta: {
          title: 'Create',
          icon: 'magic',
          requiresAuth: true
        },
        children: [
          {
            index: true,
            element: <RouteWrapper component={CreateHome} translationKey="createPage" />,
            meta: {
              title: 'Create Dashboard',
              keepAlive: true
            }
          },
          {
            path: 'textToImage',
            element: <RouteWrapper component={TextToImagePage} translationKey="createPage.textToImage" />,
            meta: { title: 'Text to Image', keepAlive: true }
          },
          {
            path: 'viralVideo',
            element: <RouteWrapper component={ViralVideoPage} translationKey="createPage.viralVideo" />,
            meta: { title: 'Viral Video', keepAlive: true }
          },
          {
            path: 'imgToVideo',
            element: <RouteWrapper component={ImageToVideoPage} translationKey="createPage.imgToVideo" />,
            meta: { title: 'Image to Video', keepAlive: true }
          },
          {
            path: 'digitalHuman',
            element: <RouteWrapper
              component={DigitalHumanPage}
              mapContextToProps={(t) => ({
                t: t?.createPage?.digitalHuman,
                productAvatarT: t?.createPage?.productAvatar
              })}
            />,
            meta: { title: 'Digital Human', keepAlive: true }
          },
          {
            path: 'styleTransfer',
            element: <RouteWrapper component={StyleTransferPage} translationKey="createPage.styleTransfer" />,
            meta: { title: 'Style Transfer', keepAlive: true }
          },
          {
            path: 'voiceClone',
            element: <RouteWrapper component={VoiceClone} translationKey="createPage.voiceClone" />,
            meta: { title: 'Voice Clone', keepAlive: true }
          },
          {
            path: '3dModel',
            element: <RouteWrapper component={ThreeDModelPage} />,
            meta: { title: '3D Model', keepAlive: true }
          },
          {
            path: 'glbViewer',
            element: <RouteWrapper component={GlbViewerPage} translationKey="createPage.glbViewer" />,
            meta: { title: 'GLB Viewer', keepAlive: true }
          },
          {
            path: 'aiFaceSwap',
            element: <RouteWrapper component={AiFaceSwapPage} translationKey="createPage.faceSwap" />,
            meta: { title: 'Face Swap', keepAlive: true }
          },
          {
            path: 'tts',
            element: <RouteWrapper component={TtsPage} translationKey="createPage.ttsTool" />,
            meta: { title: 'TTS', keepAlive: true }
          },
          {
            path: 'useTool',
            element: <RouteWrapper component={UseToolPage} />,
            meta: { title: 'Use Tool', keepAlive: true }
          },
          {
            path: 'imageTranslation',
            element: <RouteWrapper component={AIFaceSwappingPage} translationKey="createPage.imageTranslation" />,
            meta: { title: 'Image Translation', keepAlive: true }
          },
          {
            path: 'templateUi',
            element: <RouteWrapper component={TemplateUiPage} />,
            meta: { title: 'Template UI', keepAlive: true }
          },
          {
            path: 'workshop',
            element: <RouteWrapper component={WorkshopPage} translationKey="createPage.workshop" />,
            meta: { title: 'Workshop', keepAlive: true }
          }
        ]
      },
      {
        path: 'assets',
        element: <RouteWrapper component={AssetsPage} translationKey="assetsPage" />,
        meta: {
          title: 'Assets',
          icon: 'folder',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'chat',
        element: <RouteWrapper component={ChatPage} translationKey="chatPage" />,
        meta: {
          title: 'Chat',
          icon: 'message',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'keys',
        element: <RouteWrapper component={KeysPage} translationKey="keysPage" />,
        meta: {
          title: 'Keys',
          icon: 'key',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'rank',
        element: <RouteWrapper component={RankPage} translationKey="rankPage" />,
        meta: {
          title: 'Leaderboard',
          icon: 'trophy',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'models',
        element: <RouteWrapper component={ModelSquarePage} translationKey="modelSquare" />,
        meta: {
          title: 'Models',
          icon: 'grid',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'expenses',
        element: <RouteWrapper component={ExpensesPage} translationKey="expensesPage" />,
        meta: {
          title: 'Expenses',
          icon: 'dollar-sign',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'pricing',
        element: <RouteWrapper component={PricingPage} translationKey="pricingPage" />,
        meta: {
          title: 'Pricing',
          icon: 'credit-card',
          keepAlive: true
        }
      },
      {
        path: 'price-list',
        element: <RouteWrapper component={PriceListPage} translationKey="priceListPage" />,
        meta: {
          title: 'Price List',
          icon: 'list',
          requiresAuth: true,
          keepAlive: true
        }
      },
      {
        path: 'profile',
        element: <RouteWrapper component={ProfilePage} translationKey="profilePage" />,
        meta: {
          title: 'Profile',
          icon: 'user',
          requiresAuth: true,
          keepAlive: true
        }
      }
    ]
  }
];
