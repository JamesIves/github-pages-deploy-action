<p align="center">
  <a href="https://github.com/marketplace/actions/deploy-to-github-pages">
    <img alt="Logotipo da Ação de Implantação no GitHub Pages" width="200px" src="https://github.com/JamesIves/github-pages-deploy-action/raw/dev/.github/assets/icon.png">
  </a>
</p>

<h1 align="center">
  Ação de Implantação no GitHub Pages :rocket:
</h1>

<p align="center">
  <a href="https://github.com/JamesIves/github-pages-deploy-action/actions">
    <img src="https://github.com/JamesIves/github-pages-deploy-action/workflows/unit-tests/badge.svg" alt="Emblema de status de testes unitários">
  </a>
  
  <a href="https://github.com/JamesIves/github-pages-deploy-action/actions">
    <img src="https://github.com/JamesIves/github-pages-deploy-action/workflows/integration-tests/badge.svg" alt="Emblema de status de testes de integração">
  </a>
  
  <a href="https://codecov.io/gh/JamesIves/github-pages-deploy-action/branch/dev">
    <img src="https://codecov.io/gh/JamesIves/github-pages-deploy-action/branch/dev/graph/badge.svg" alt="Emblema de status de cobertura de código">
  </a>
  
  <a href="https://github.com/JamesIves/github-pages-deploy-action/releases">
    <img src="https://img.shields.io/github/v/release/JamesIves/github-pages-deploy-action.svg?logo=github" alt="Emblema de versão de lançamento">
  </a>
  
  <a href="https://github.com/marketplace/actions/deploy-to-github-pages">
    <img src="https://img.shields.io/badge/action-marketplace-blue.svg?logo=github&color=orange" alt="Emblema do marketplace do GitHub">
  </a>
</p>

<p align="center">
  Implante automaticamente o seu projeto no <a href="https://pages.github.com/">GitHub Pages</a> com <a href="https://github.com/features/actions">GitHub Actions</a>. Esta ação pode ser configurada para enviar o seu código pronto para produção para qualquer ramo que você desejar, incluindo <b>gh-pages</b> e <b>docs</b>. Ela também pode lidar com implantações entre repositórios diferentes e funciona com o <a href="https://github.com/enterprise">GitHub Enterprise</a> também.
</p>

<p align="center">
  <img src="https://github.com/JamesIves/github-pages-deploy-action/raw/dev/.github/assets/screenshot.png" alt="">
</p>

<p align="center">
  A manutenção deste projeto é possível graças a todos os <a href="https://github.com/JamesIves/github-pages-deploy-action/graphs/contributors">contribuidores</a> e <a href="https://github.com/sponsors/JamesIves">patrocinadores</a>. Se você gostaria de patrocinar este projeto e ter a sua imagem ou o logotipo da sua empresa aparecendo abaixo, <a href="https://github.com/sponsors/JamesIves">clique aqui</a>. 💖
</p>

<p align="center">
<!-- premium --><!-- premium -->
</p>

<p align="center">
<!-- patrocinadores --><a href="https://github.com/Chooksta69"><img src="https://github.com/Chooksta69.png" width="50px" alt="Chooksta69" /></a>&nbsp;&nbsp;<a href="https://github.com/robjtede"><img src="https://github.com/robjtede.png" width="50px" alt="robjtede" /></a>&nbsp;&nbsp;<a href="https://github.com/hadley"><img src="https://github.com/hadley.png" width="50px" alt="hadley" /></a>&nbsp;&nbsp;<a href="https://github.com/kevinchalet"><img src="https://github.com/kevinchalet.png" width="50px" alt="kevinchalet" /></a>&nbsp;&nbsp;<a href="https://github.com/sckott"><img src="https://github.com/sckott.png" width="50px" alt="sckott" /></a>&nbsp;&nbsp;<a href="https://github.com/electrovir"><img src="https://github.com/electrovir.png" width="50px" alt="electrovir" /></a>&nbsp;&nbsp;<!-- patrocinadores -->
</p>

## Começando :airplane:

Você pode incluir esta ação no seu fluxo de trabalho para ser acionada em qualquer evento que o [GitHub Actions suporta](https://help.github.com/en/articles/events-that-trigger-workflows). Se o ramo remoto no qual você deseja implantar ainda não existir, a ação irá criá-lo para você. O seu fluxo de trabalho também precisará incluir a etapa `actions/checkout` antes deste fluxo de trabalho ser executado para que a implantação funcione. Se você pretende fazer várias implantações em rápida sucessão, [você pode precisar usar o parâmetro de concorrência no seu fluxo de trabalho](https://docs.github.com/en/actions/learn-github-actions/workflow-syntax-for-github-actions#concurrency) para evitar sobreposições.

Você pode ver um exemplo disso abaixo.

``` yaml
name: Construir e Implantar
on: [push]
permissions:
  contents: write
jobs:
  build-and-deploy:
    concurrency: ci-${{ github.ref }} # Recomendado se você pretende fazer várias implantações rapidamente.
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Instalar e Construir 🔧 # Este exemplo de projeto é construído usando npm e os resultados são armazenados na pasta 'build'. Substitua pelos comandos necessários para construir o seu projeto ou remova completamente esta etapa se o seu site já estiver pré-construído.
        run: |
          npm ci
          npm run build

      - name: Implantar 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: build # A pasta que a ação deve implantar.
```

Se você deseja fazer com que o fluxo de trabalho seja acionado apenas em eventos de push para ramos específicos, você pode modificar a seção on.

```yml
on:
  push:
    branches:
      - main
```

> **Warning**
> Se você não fornecer à ação um token de acesso ou uma chave SSH, você deve acessar as configurações do seu repositório e conceder as `Permissões de Leitura e Escrita` ao `GITHUB_TOKEN` fornecido, caso contrário, poderá encontrar problemas de permissão. Alternativamente, você pode definir o seguinte em seu arquivo de fluxo de trabalho para conceder à ação as permissões necessárias.

```yml
permissions:
  contents: write
```

## Configuração 📁

A parte `with` do fluxo de trabalho **deve** ser configurada antes que a ação funcione. Você pode adicionar essas configurações na seção `with` encontrada nos exemplos acima. Quaisquer `secrets` devem ser referenciados usando a sintaxe de colchetes e armazenados no menu `Configurações/Secrets` do repositório do GitHub. Você pode aprender mais sobre a configuração de variáveis de ambiente com as ações do GitHub [aqui](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets#creating-encrypted-secrets).

#### Configuração Obrigatória

As seguintes opções devem ser configuradas para fazer uma implantação.

| Chave    | Informações do Valor                                                                                                                                                                                                                                                                                                        | Tipo   | Obrigatório |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| `folder` | A pasta no seu repositório que você deseja implantar. Se o seu script de construção compilar em um diretório chamado `build`, você deve inseri-lo aqui. Se você deseja implantar o diretório raiz, você pode colocar um `.` aqui. Você também pode utilizar caminhos de arquivo absolutos adicionando `~` ao caminho da sua pasta. | `with` | **Sim**     |

Por padrão, a ação não precisa de nenhuma configuração de token e utiliza o token do GitHub com escopo de repositório fornecido para fazer a implantação. Se você precisar de mais personalização, você pode modificar o tipo de implantação usando as seguintes opções.

| Chave      | Informações do Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Tipo   | Obrigatório |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------- |
| `token`    | Esta opção por padrão utiliza o Token do GitHub com escopo de repositório. No entanto, se você precisar de mais permissões para coisas como implantação em outro repositório, você pode adicionar um Token de Acesso Pessoal (PAT) aqui. Isso deve ser armazenado no menu `secrets / with` **como um segredo**. Recomendamos o uso de uma conta de serviço com as permissões mínimas necessárias e recomendamos que, ao gerar um novo PAT, você selecione as escopos de permissão mínimos necessários. [Saiba mais sobre a criação e uso de segredos criptografados aqui.](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/creating-and-using-encrypted-secrets) | `with` | **Não**     |
| `ssh-key`  | Você pode configurar a ação para implantar usando SSH definindo esta opção como uma chave SSH privada armazenada **como um segredo**. Também pode ser definido como `true` para usar uma configuração de cliente SSH existente. Para obter informações mais detalhadas sobre como adicionar seu par de chaves ssh público/privado, consulte a [seção Usando uma Chave de Implantação deste README](https://github.com/JamesIves/github-pages-deploy-action/tree/dev#using-an-ssh-deploy-key-).                                                                                                                                                                      | `with` | **Não**     |

#### Escolhas Opcionais

| Chave                | Informações do Valor                                                                                                                                                                                                                                                                                                                                                           | Tipo   | Obrigatório |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- |
| `branch`             | Este é o ramo para o qual você deseja implantar, por exemplo, `gh-pages` ou `docs`. O padrão é `gh-pages`.                                                                                                                                                                                                                                                                        | `with` | **Não**   |
| `git-config-name`    | Permite que você personalize o nome que está vinculado à configuração do git, que é usada ao fazer push das confirmações de implantação. Se isso não estiver incluído, ele usará o nome no contexto do GitHub, seguido pelo nome da ação.                                                                                                                                              | `with` | **Não**   |
| `git-config-email`   | Permite que você personalize o e-mail que está vinculado à configuração do git, que é usada ao fazer push das confirmações de implantação. Se isso não estiver incluído, ele usará o e-mail no contexto do GitHub, seguido por um e-mail genérico do GitHub noreply. Você pode incluir `<>` para o valor se desejar omitir completamente este campo e fazer push das confirmações sem um e-mail.                | `with` | **Não**   |
| `repository-name`    | Permite que você especifique um caminho de repositório diferente, desde que tenha permissões para fazer push nele. Isso deve ser formatado da seguinte forma: `JamesIves/github-pages-deploy-action`. Você precisará usar um PAT na entrada `token` para que esta opção de configuração funcione corretamente.                                                                                                    | `with` | **Não**   |
| `target-folder`      | Se você deseja enviar o conteúdo da pasta de implantação para um diretório específico no ramo de implantação, você pode especificá-lo aqui.                                                                                                                                                                                                                                     | `with` | **Não**   |
| `commit-message`     | Se você precisar personalizar a mensagem de confirmação para uma integração, pode fazê-lo.                                                                                                                                                                                                                                                                                               | `with` | **Não**   |
| `clean`              | Você pode usar esta opção para excluir arquivos do destino de implantação que não existem mais na origem da implantação. Um caso de uso é se o seu projeto gera arquivos hash que variam de compilação para compilação. Usar `clean` não afetará os diretórios `.git`, `.github` ou `.ssh`. Esta opção está ativada por padrão e pode ser desativada definindo-a como `false`. | `with` | **Não**   |
| `clean-exclude`      | Se você precisar usar `clean`, mas desejar preservar determinados arquivos ou pastas, pode usar esta opção. Isso deve conter cada padrão em uma única linha em uma string multilinha.                                                                                                                                                                                            | `with` | **No**   |
| `dry-run`            | Não realize o push de fato, mas use `--dry-run` nas invocações de `git push` em vez disso.                                                                                                                                                                                                                                                                                           | `with` | **Não**   |
| `single-commit`      | Esta opção pode ser ativada para `true` se você preferir ter uma única confirmação no ramo de implantação em vez de manter todo o histórico. **Usar esta opção também fará com que todo o histórico existente seja apagado do ramo de implantação**.                                                                                                                           | `with` | **Não**   |
| `force`              | Força a substituição de implantações novas ao ramo de destino; caso contrário, tenta fazer rebase das novas implantações em qualquer existente. Esta opção está ativada por padrão e pode ser desativada definindo-a como `false`, o que pode ser útil se houver várias implantações em um único ramo.                                                                           | `with` | **Não**   |
| `silent`             | Silencia a saída da ação, evitando que exiba mensagens do git.                                                                                                                                                                                                                                                                                                      | `with` | **Não**   |
| `tag`                | Adicione uma tag à confirmação. Funciona apenas quando `dry-run` não é usado.                                                                                                                                                                                                                                                                                                             | `with` | **No**   |

Com a ação configurada corretamente, você deverá ver o fluxo de trabalho acionar a implantação nas condições configuradas.

#### Status da Implantação

A ação exportará uma variável de ambiente chamada `deployment_status` que você pode usar em seu fluxo de trabalho para determinar se a implantação foi bem-sucedida ou não. Você pode encontrar uma explicação de cada tipo de status abaixo.

| Status    | Descrição                                                                                     |
| --------- | ----------------------------------------------------------------------------------------------- |
| `success` | O status `success` indica que a ação conseguiu implantar com sucesso no ramo.   |
| `failed`  | O status `failed` indica que a ação encontrou um erro ao tentar implantar.      |
| `skipped` | O status `skipped` indica que a ação saiu prematuramente, pois não havia nada novo para implantar. |

Este valor também é definido como uma saída da etapa como `deployment-status`.

### Usando uma Chave de Implantação SSH 🔑

Se você preferir usar uma chave de implantação SSH em vez de um token, primeiro você deve gerar uma nova chave SSH executando o seguinte comando no terminal, substituindo o email pelo que está conectado à sua conta do GitHub.

``` bash
ssh-keygen -t rsa -m pem -b 4096 -C "seuemailaqui@example.com" -N ""
```

Depois de gerar o par de chaves, você deve adicionar o conteúdo da chave pública no menu de [chaves de implantação](https://developer.github.com/v3/guides/managing-deploy-keys/) do seu repositório. Você pode encontrar esta opção em `Configurações > Chaves de Implantação`. Você pode nomear a chave pública como quiser, mas **precisa** conceder permissões de gravação a ela. Em seguida, adicione o conteúdo da chave privada ao menu `Configurações > Secrets` como `DEPLOY_KEY`.

Com isso configurado, você pode definir a parte `ssh-key` da ação como sua chave privada armazenada como um segredo.

```yml
- name: Implantação 🚀
  uses: JamesIves/github-pages-deploy-action@v4
  with:
    folder: site
    ssh-key: ${{ secrets.DEPLOY_KEY }}
```

<details><summary>Você pode ver um exemplo completo disso aqui.</summary>
<p>

```yml
name: Construir e Implantação
on:
  push:
    branches:
      - main
jobs:
  deploy:
    concurrency: ci-${{ github.ref }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Instalar e Construir 🔧 # Este projeto de exemplo é construído usando npm e produz o resultado na pasta 'build'. Substitua pelos comandos necessários para construir seu projeto, ou remova esta etapa completamente se seu site estiver pré-construído.
        run: |
          npm ci
          npm run build

      - name: Implantação 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: build
          clean: true
          clean-exclude: |
            special-file.txt
            some/*.txt
          ssh-key: ${{ secrets.DEPLOY_KEY }}
```

</p>
</details>

Alternativamente, se você já configurou o cliente SSH em uma etapa anterior, você pode definir a opção `ssh-key` como `true` para permitir que ele faça a implantação usando um cliente SSH existente. Em vez de ajustar a configuração do cliente, ele simplesmente mudará para usar os pontos de extremidade SSH do GitHub.

---

### Suporte a Sistemas Operacionais 💿

Esta ação é principalmente desenvolvida usando o [Ubuntu](https://ubuntu.com/). [Na configuração de trabalho do seu fluxo de trabalho](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idruns-on), é recomendável definir a propriedade `runs-on` como `ubuntu-latest`.

```yml
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
```

Se você estiver usando um sistema operacional como o [Windows](https://www.microsoft.com/en-us/windows/), você pode contornar isso usando [artifacts](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/persisting-workflow-data-using-artifacts). Na configuração do seu fluxo de trabalho, você pode utilizar as ações `actions/upload-artifact` e `actions/download-artifact` para mover seu projeto construído em um trabalho do Windows para um trabalho secundário que lidará com a implantação.

<details><summary>Você pode ver um exemplo desse padrão aqui.</summary>
<p>

```yml
name: Construir e Implantação
on: [push]
permissions:
  contents: write
jobs:
  build:
    runs-on: windows-latest # O primeiro trabalho utiliza o windows-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Instalar e Construir 🔧 # Este projeto de exemplo é construído usando npm e produz o resultado na pasta 'build'. Substitua pelos comandos necessários para construir seu projeto, ou remova esta etapa completamente se seu site estiver pré-construído.
        run: |
          npm ci
          npm run build

      - name: Carregar Artefatos 🔺 # Em seguida, o projeto é carregado como um artefato com o nome 'site'.
        uses: actions/upload-artifact@v1
        with:
          name: site
          path: build

  deploy:
    concurrency: ci-${{ github.ref }}
    needs: [build] # O segundo

 trabalho deve depender do primeiro para ser concluído antes de ser executado e usa ubuntu-latest em vez de windows.
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Baixar Artefatos 🔻 # O projeto construído é baixado para a pasta 'site'.
        uses: actions/download-artifact@v1
        with:
          name: site

      - name: Implantação 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: 'site' # A pasta de implantação deve corresponder ao nome do artefato. Mesmo que nosso projeto seja construído na pasta 'build', o nome do artefato 'site' deve ser colocado aqui.
```

</p>
</details>

---

### Usando um Contêiner 🚢

Se você usar um [contêiner](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/workflow-syntax-for-github-actions#jobsjob_idcontainer) em seu fluxo de trabalho, talvez precise executar uma etapa adicional para instalar o `rsync`, pois esta ação depende dele. Você pode ver um exemplo disso abaixo.

```yml
- name: Instalar o rsync 📚
  run: |
    apt-get update && apt-get install -y rsync

- name: Implantação 🚀
  uses: JamesIves/github-pages-deploy-action@v4
```

---

### Arquivos de Construção Adicionais 📁

Se você estiver usando um domínio personalizado e precisar de um arquivo `CNAME`, ou se precisar usar um arquivo `.nojekyll`, você pode comprometê-los com segurança diretamente no ramo de implantação sem que eles sejam substituídos após cada implantação. Além disso, você pode incluir esses arquivos na sua pasta de implantação para atualizá-los. Se você precisar adicionar arquivos adicionais à implantação que devem ser ignorados pelas etapas de limpeza da construção, você pode utilizar a opção `clean-exclude`.

<details><summary>Clique aqui para ver um exemplo disso.</summary>
<p>

```yml
name: Construir e Implantação
permissions:
  contents: write
on:
  push:
    branches:
      - main
jobs:
  deploy:
    concurrency: ci-${{ github.ref }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 🛎️
        uses: actions/checkout@v3

      - name: Instalar e Construir 🔧 # Este projeto de exemplo é construído usando npm e produz o resultado na pasta 'build'. Substitua pelos comandos necessários para construir seu projeto, ou remova esta etapa completamente se seu site estiver pré-construído.
        run: |
          npm ci
          npm run build

      - name: Implantação 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: build
          clean: true
          clean-exclude: |
            special-file.txt
            some/*.txt
```

</p>
</details>

Se você deseja remover esses arquivos, deve acessar diretamente o ramo de implantação para removê-los. Isso é para evitar que alterações acidentais no seu script de implantação criem problemas.
