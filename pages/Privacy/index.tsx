import React from 'react';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">《Nebula Lab隐私政策》</h1>
        </header>
        
        <section className="prose prose-gray dark:prose-invert max-w-none">
          <div className="bg-surface border border-border rounded-lg p-6 mb-6">
            <p className="text-muted mb-4">
              为使用Nebula Lab服务，您应当阅读并遵守《Nebula Lab隐私政策》（以下简称"隐私政策"）。请您务必审慎阅读、充分理解各条款内容。
            </p>
            
            <p className="text-muted mb-4">
              <strong>Nebula Lab重视您的隐私</strong>，我们感谢您对Nebula Lab的信任，本隐私政策将解释对于您在Nebula Lab网页及其信息介绍的子页面，提交的信息（下称"网页"）上的个人信息之处理时间、方式及原因，并规定了您对该信息所持有的相关选择和权利。请仔细阅读——了解我们如何收集和使用您的信息，以及您可以如何控制这些信息非常重要。
            </p>
            
            <p className="text-muted mb-4">
              本隐私政策仅适用于Nebula Lab网页（包括信息介绍的子页面，以及通过信息提交页面提交的信息）。如您使用Nebula Lab或其关联方运作的产品或服务，并欲了解相关数据如何被处理，请查阅隐私政策。
            </p>
            
            <p className="text-muted mb-4">
              <strong>如果您不同意按照本隐私政策所述方式处理您的个人信息，请不要在收到请求时提供您的信息，并停止使用本网页。继续使用本网页即表示您确认我们在本隐私政策中所述的有关您个人信息的规定。</strong>
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">一、我们使用的个人信息类型</h2>
          <p className="text-muted mb-4">
            我们将向您收集不同类型的个人信息，以及我们如何收集这些个人信息。如果您想进一步了解特定数据类型以及我们如何使用这些数据，请参阅下面的部分"我们如何使用您的个人信息"。
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-muted">
            <li>
              <strong>您提供给我们的信息：</strong>在您通过我们网站上的页面提交问询，或使用本隐私政策中指定的联系方式联系我们时，您即向我们提供与您问询相关的特定信息。
            </li>
            <li>
              <strong>我们自动收集的信息：</strong>当您访问我们的网页时，我们会自动收集某些信息，例如您的IP地址、浏览器类型、访问时间等。
            </li>
            <li>
              <strong>第三方来源的信息：</strong>我们可能从第三方服务提供商处获取您的信息，以改善我们的服务。
            </li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">二、我们如何使用您的个人信息</h2>
          <p className="text-muted mb-4">
            我们使用收集的个人信息用于以下目的：
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-muted">
            <li>提供、维护和改进我们的服务</li>
            <li>处理您的请求和查询</li>
            <li>发送重要通知和更新</li>
            <li>进行数据分析以改善用户体验</li>
            <li>遵守法律法规要求</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">三、信息存储和安全</h2>
          <p className="text-muted mb-4">
            您的个人信息由我们位于中华人民共和国境内的服务器处理。我们的网页运维及技术团队位于中华人民共和国。我们将严格按照法律法规的规定，及根据本隐私政策，采取严格安全的保护措施，保护您的权利。
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">四、信息保留期限</h2>
          <p className="text-muted mb-4">
            您提交问询表格或使用本隐私政策中指定的详细信息联系我们时向我们提供的信息：直至您的问询得到解决，然后在解决后的三百六十 (360) 天内删除该信息，除非您同意保留这些数据并在将来接收更多信息。
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">五、您的权利</h2>
          <p className="text-muted mb-4">
            根据适用的隐私法律，您可能拥有以下权利：
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-muted">
            <li>访问您的个人信息</li>
            <li>更正不准确的个人信息</li>
            <li>删除您的个人信息</li>
            <li>限制或反对处理您的个人信息</li>
            <li>数据可携带权</li>
          </ul>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">六、联系我们</h2>
          <p className="text-muted mb-4">
            欢迎就本隐私政策提出问题、意见和请求。我们设立了专门的个人信息保护团队和个人信息保护负责人，如果您对本隐私政策或个人信息保护相关事宜有任何疑问或投诉、建议，您可以出于遵守适用隐私法的目的，向指定的个人信息保护负责人提出此类反馈，其联系方式为 <a href="mailto:mla@nebula-data.com" className="text-indigo-600 hover:underline">mla@nebula-data.com</a>。
          </p>

          <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">七、隐私政策的更新</h2>
          <p className="text-muted mb-4">
            如果本隐私政策有任何变更，我们将在此发布更新的隐私政策。请定期访问本页面，查看本隐私政策是否有任何更新或变更。
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPage;

