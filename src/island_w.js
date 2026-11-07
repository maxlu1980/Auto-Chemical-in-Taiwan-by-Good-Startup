/* ===== [island_w.js] ===== */
  /* ================= (v43) Taipei: the saleswoman on the lawn under the camphor trees =================
     The software company's account manager from the bench in Daan Forest Park, after work in Taipei: on a small lawn at the east end of
     the station's south plaza, under camphor trees, in her open camel cardigan, black top and jeans (the newest photograph), her laptop tote
     and a coffee on the grass beside her. Her story runs over several visits in the messenger, as the city's people talk: the night before
     the final presentation of a deal she has followed for eight months, a rehearsal in which Luna plays the client's CISO (three questions),
     the result (it depends a little on the rehearsal), her card, and the talks after (the week's security news, small habits that keep a
     phone and an account safe, the station's lights, pasta). Dated lines follow the news of October 2026. */
  var OLWX = {
    zh: { contact: '軟體公司業務', navS: '南廣場東側 · 樟樹下的草地', hiN: '嗨，晚上好！草地還留著一點白天的溫度，要不要坐一下？', hiD: '嗨，午安！這棵樟樹底下很涼，要不要坐一下？',
      rehK: '簡報彩排', rehT: '第 {n} 題 / 3', rehQ: '妳現在是客戶的資安長。選出她最該說的回答。', next: '下一題', done: '完成彩排', score: '答對 {n} 題', s3: '三題全對！妳當資安長太適合了，我現在很有信心。', s2: '兩題對，很好！剩下那題我再把說法修一修。', s1: '只對一題……沒關係，彩排就是用來犯錯的。', s0: '一題都沒中？哈哈，妳是故意考驗我的吧！',
      cardK: '軟體公司業務', cardT: '收到她的名片', cardP: '她把名片遞給妳，背面有一行手寫字。', cardRole: 'Account Manager · 資安服務', cardCity: '台北', cardNote: '先修補，再驗證。謝謝妳，資安長ルナ。', cardGot: '收下', cardToast: '收到名片 · 獲得 {c} 枚代幣', again: '再彩排一次', later: '晚點再說' },
    en: { contact: 'Software account manager', navS: 'East end of the south plaza · the lawn under the camphor trees', hiN: 'Hi, good evening! The grass still holds a little of the day\'s warmth — sit for a bit?', hiD: 'Hi, good afternoon! It\'s cool under this camphor tree — sit for a bit?',
      rehK: 'Rehearsal', rehT: 'Question {n} of 3', rehQ: 'You are the client\'s CISO now. Pick the answer she should give.', next: 'Next question', done: 'Finish the rehearsal', score: '{n} right', s3: 'All three! You make a great CISO — I feel ready now.', s2: 'Two right — good! I\'ll polish the wording on the other one.', s1: 'Just one… that\'s fine. Rehearsals are for mistakes.', s0: 'None at all? Ha — you were testing me on purpose, weren\'t you!',
      cardK: 'Software account manager', cardT: 'Her business card', cardP: 'She hands you her card. There\'s a handwritten line on the back.', cardRole: 'Account Manager · Security services', cardCity: 'Taipei', cardNote: 'Patch first, then verify. Thank you, CISO Luna.', cardGot: 'Take it', cardToast: 'Business card received · {c} coins', again: 'Rehearse again', later: 'Later' },
    ja: { contact: 'ソフトウェア会社の営業', navS: '南口広場の東・クスノキの下の芝生', hiN: 'こんばんは！芝生、まだ昼のぬくもりが残ってるの。少し座らない？', hiD: 'こんにちは！このクスノキの下、涼しいの。少し座らない？',
      rehK: 'プレゼンのリハーサル', rehT: '第 {n} 問 / 3', rehQ: 'あなたは今、お客様の CISO。彼女が言うべき答えを選んで。', next: '次の問題', done: 'リハーサル完了', score: '{n} 問正解', s3: '三問とも正解！CISO役、ぴったりね。もう自信がついた。', s2: '二問正解、いいね！残りの一問は言い方を直しておく。', s1: '一問だけ……大丈夫、リハーサルは失敗するためにあるの。', s0: '全部はずれ？ふふ、わざと試したでしょう！',
      cardK: 'ソフトウェア会社の営業', cardT: '彼女の名刺', cardP: '名刺を渡してくれた。裏に手書きの一行がある。', cardRole: 'Account Manager・セキュリティサービス', cardCity: '台北', cardNote: 'まずパッチ、それから検証。ありがとう、CISO のルナ。', cardGot: '受け取る', cardToast: '名刺を受け取った・コイン {c} 枚', again: 'もう一度リハーサル', later: 'あとで' } };
  function olw(k) { var L = OLWX[LANG] || OLWX.zh; return L[k] != null ? L[k] : OLWX.zh[k]; }
  /* the rehearsal: the CISO's three questions, three answers each (the first is the one to give; the order is shuffled on the card) and what she says to each */
  var OLWQ = {
    zh: [{ q: '「上週 PHP 一次爆出兩個 9.2 分、不用登入就能遠端執行的漏洞。如果明天又來一個，你們能做什麼？」', a: ['先盤點哪些系統對外曝險，當天套上虛擬修補擋住攻擊，同時 24 小時監控，再陪你們排好正式修補的順序。', '我們的產品能擋下所有攻擊，零時差也完全不用擔心。', '那是 PHP 官方的問題，等他們修好就好。'], r: ['對，不能誇口「全擋」，要講清楚我們會怎麼陪他們走完。', '太滿了。資安長最怕聽到「全擋」——沒有人能保證百分之百。', '不行不行，客戶要的是「今天能做什麼」，不是等。'] },
      { q: '「你們的方案比外商貴了一成，理由是什麼？」', a: ['價格裡包含在地 24 小時的應變團隊：出事時用中文溝通、兩小時內到場，還有每季的實戰演練。', '今天簽約的話，我們可以再打八折。', '外商的產品其實問題很多，您不要相信他們。'], r: ['就是這個！客戶買的不只是軟體，是出事時有人接電話。', '一開口就降價，等於承認不值這個價。先講清楚價值。', '批評對手是大忌，客戶只會覺得我們不專業。'] },
      { q: '「最近連 AI 代理都被拿來入侵了，你們的服務有什麼不一樣？」', a: ['我們用 AI 加快偵測和分析，但關鍵處置一定經過人工確認；所有 AI 的存取都有權限和紀錄。', '我們全部交給 AI 自動處理，完全不需要人介入。', 'AI 攻擊只是新聞炒作，不用太擔心。'], r: ['對——速度交給 AI，判斷留給人。', '全自動聽起來很炫，但關鍵決策沒有人把關，資安長不會放心。', '輕忽風險最危險。這週美國就有銀行發現客戶帳戶被未經授權的 AI 代理存取。'] }],
    en: [{ q: '"Last week PHP disclosed two 9.2-rated flaws that run code remotely without logging in. If another one lands tomorrow, what will you do?"', a: ['First map which systems are exposed, put a virtual patch in front of them that day, watch them around the clock, and help you plan the order of the real patches.', 'Our product stops every attack — you never need to worry about zero-days.', 'That\'s PHP\'s problem. Just wait for them to fix it.'], r: ['Yes — never promise "blocks everything"; say exactly how we\'ll see them through.', 'Too much. A CISO dreads "blocks everything" — nobody can promise a hundred percent.', 'No, no — the client wants to hear what we can do today, not to wait.'] },
      { q: '"Your offer is ten percent above the international vendor\'s. Why?"', a: ['The price includes a local 24-hour response team: on site within two hours, in your own language, plus a live drill every quarter.', 'If you sign today we can take another twenty percent off.', 'Their product has lots of problems, honestly. Don\'t trust them.'], r: ['That\'s it! They\'re not just buying software — they\'re buying someone who picks up the phone.', 'Cutting the price first admits it isn\'t worth it. Explain the value first.', 'Running down a rival is a cardinal sin — it only makes us look unprofessional.'] },
      { q: '"These days even AI agents are used to break in. What makes your service different?"', a: ['We use AI to speed up detection and analysis, but every critical action is confirmed by a person, and every AI access is scoped and logged.', 'We hand everything to AI automation — no people needed at all.', 'AI attacks are just media hype. Nothing to worry about.'], r: ['Exactly — speed to the AI, judgement to people.', 'Fully automatic sounds slick, but with no one checking key decisions a CISO won\'t relax.', 'Shrugging off risk is the most dangerous thing. This week US banks found customer accounts accessed by unauthorized AI agents.'] }],
    ja: [{ q: '「先週、PHP でログイン不要のリモートコード実行の脆弱性が二つ、9.2 点で出ました。明日また来たら、何ができますか？」', a: ['まず外部に晒されているシステムを洗い出し、その日のうちに仮想パッチで攻撃を止め、24 時間監視しながら正式なパッチの順番を一緒に決めます。', '当社の製品はすべての攻撃を防ぎます。ゼロデイも心配いりません。', 'それは PHP 側の問題なので、修正を待てば大丈夫です。'], r: ['そう、「全部防ぐ」とは言わない。どう一緒に乗り切るかをはっきり言うの。', '言いすぎ。CISO が一番嫌うのが「全部防ぐ」。100% は誰にも約束できない。', 'だめだめ、お客様が聞きたいのは「今日何ができるか」。待つことじゃない。'] },
      { q: '「御社の提案は外資より一割高い。理由は？」', a: ['価格には地元の 24 時間対応チームが含まれます。有事には母国語で、2 時間以内に現地へ。四半期ごとの実地訓練もあります。', '今日ご契約いただければ、さらに二割引きにします。', '外資の製品は問題だらけですから、信用しないほうがいいです。'], r: ['それ！ お客様が買うのはソフトだけじゃなく、何かあった時に電話に出る人。', 'すぐ値下げするのは、その価値がないと認めるのと同じ。まず価値を説明して。', '競合の悪口は禁じ手。こちらが素人に見えるだけ。'] },
      { q: '「最近は AI エージェントまで侵入に使われる。御社のサービスは何が違う？」', a: ['AI で検知と分析を速くしますが、重要な対処は必ず人が確認します。AI のアクセスはすべて権限を絞り、記録しています。', 'すべて AI に任せて自動処理します。人は一切いりません。', 'AI 攻撃なんてニュースの誇張です。気にしなくて大丈夫。'], r: ['そう、スピードは AI に、判断は人に。', '全自動は格好いいけど、重要な判断を誰も確かめないなら CISO は安心できない。', 'リスクを軽く見るのが一番危ない。今週、米国の銀行で顧客口座への無許可の AI エージェントのアクセスが見つかったの。'] }] };

  /* the conversations: 'o' is she, 'me' is Luna (the messenger shows them as a thread, as the city's people talk) */
  Object.assign(GD.zh, {
    olw_meet: [['me', '好呀！……姐姐在這裡做什麼呢？'], ['o', '我在軟體公司做業務，賣的是資安服務——幫企業盯著網路、擋攻擊，出事時陪他們一起處理。'], ['o', '明天一早我要搭高鐵去台中，向一家精密機械廠做最後簡報。這個案子我跟了八個月。'], ['me', '八個月！好厲害……會緊張嗎？'], ['o', '會呀。對方的資安長很嚴格，每次都挑最難的問。所以我習慣坐在這片草地上，把答案一題一題講出聲。'], ['o', '欸，可以請妳當一下我的資安長嗎？我念題目，妳幫我挑出最好的回答。']],
    olw_meetD: [['o', '咦？妳是……大安森林公園那位！上次陪我聊義大利麵的。'], ['me', '是我！姐姐今天沒穿西裝耶。'], ['o', '下班了嘛，開襟毛衣和牛仔褲才是本人。（笑）'], ['o', '明天一早我要搭高鐵去台中，向一家精密機械廠做最後簡報。這個案子我跟了八個月。'], ['me', '八個月！會緊張嗎？'], ['o', '會呀。對方的資安長很嚴格。欸，可以請妳當一下我的資安長嗎？我念題目，妳幫我挑出最好的回答。']],
    olw_again: [['o', '要再陪我彩排一次嗎？三題就好。']],
    olw_rehHi: [['o', '謝謝妳。說出口之後，心就定下來了。'], ['me', '姐姐明天一定沒問題！'], ['o', '嗯！簡報完我再告訴妳結果。妳先去逛逛吧，晚點再來找我。']],
    olw_rehLo: [['o', '哈哈，妳這個資安長好嚴格！不過剛好，錯過一次就記住了。'], ['me', '欸嘿……我也學到很多！'], ['o', '明天我會把每一題都講得更踏實。結果出來再告訴妳！']],
    olw_eve: [
      [['o', '還在這裡唷。我在背開場的第一句：「我們不賣恐懼，我們賣的是出事時的那通電話。」'], ['me', '好帥的一句！'], ['o', '這週新聞很多，客戶一定會問。印度一家憑證機構的金鑰外洩，瀏覽器和 Python 都緊急把它的憑證封掉了。'], ['o', '我會提醒他們：不只更新作業系統，程式自己帶的憑證庫也要一起更新。']],
      [['o', '台灣這週有一家電商服務平台的資料庫被非法存取，數位發展部已經去做行政檢查了。'], ['o', '接下來就會有人收到假冒的退款信。妳如果收到「點連結領退款」，千萬不要點喔。'], ['me', '我、我會小心的！']],
      [['me', '姐姐的手錶好好看。'], ['o', '謝謝！其實它是我的祕密武器——每十分鐘震一下，提醒我停下來，問客戶問題。'], ['o', '我最怕的不是被問倒，是講太快。'], ['me', '原來如此！'], ['o', '還有計步。今天跑了四個客戶，一萬兩千步。']],
      [['o', '等簡報結束，我要去吃一盤義大利麵。白酒蛤蜊，蒜片煎到金黃。'], ['me', 'ルナ也想吃！'], ['o', '那就說好了：案子談成，我請客。（笑）']]],
    olw_txg: [['o', '妳今天也去了台中？我們說不定在高鐵站擦肩而過了！']],
    olw_win: [['o', 'ルナ！我等妳好久了——簽了！客戶決定跟我們簽三年的監控服務！'], ['me', '真的嗎！太好了，恭喜姐姐！'], ['o', '資安長最後說，選我們，是因為我們沒有誇口「全擋」，而是講清楚出事時會怎麼一起處理。'], ['o', '那就是妳陪我練的第一題。這份功勞有妳一半。'], ['o', '來，這是我的名片。以後妳的工地如果需要資安健檢，打給我。']],
    olw_hold: [['o', 'ルナ！結果出來了——客戶決定把 POC 延長一個月，再比較一次。'], ['me', '啊……那是沒成功嗎？'], ['o', '還沒輸喔！資安長說我們的應變流程最清楚，只是想看我們實際演練一次。業務最重要的就是不放棄。'], ['o', '謝謝妳陪我練習。來，這是我的名片，有好消息第一個告訴妳。']],
    olw_chat: [
      [['o', '今天又在這裡寫報價單。草地比辦公室安靜，而且看得到車站的大屋頂。'], ['me', '從這裡看車站，好壯觀！'], ['o', '我第一次來台北找工作，也是坐在這裡等面試。那時候覺得這座屋頂好大，好像什麼都可能發生。']],
      [['o', '給妳一個小作業：手機和電腦都打開自動更新，重要的帳號改用通行密鑰或雙重驗證。'], ['me', '通行密鑰？'], ['o', '就是用手機的指紋或臉來登入，不用記密碼，也不怕被假網站騙走。']],
      [['o', '這週 IETF 發布了 TLS 1.3 混合式後量子金鑰交換的標準，金管會也在談金融業的遷移順序。'], ['me', '後……量子？聽起來好未來！'], ['o', '未來比想像中近喔。現在被偷走的加密資料，十年後可能就被解開，所以要從現在開始換。']],
      [['o', '支付卡產業的安全標準組織剛發了 AI 指引：AI 代理碰到明文的持卡人資料之前，要先經過人工核准。'], ['me', '跟姐姐那天說的一樣耶，判斷留給人！'], ['o', '對吧！我已經拿去當簡報素材了。']],
      [['o', '常有人以為業務每天都在應酬。其實我最常做的是聽——聽客戶在擔心什麼。'], ['o', '還有回信。很多、很多信。'], ['me', '辛苦了……ルナ幫姐姐加油！'], ['o', '有妳這句就夠了。謝謝。']]],
    olw_chatWin: [['o', '那家精密機械廠下週開始導入。我每天都在跟工程師對時程表，很忙，但很開心。'], ['me', '姐姐的笑容比平常更燦爛了！']] });
  Object.assign(GD.en, {
    olw_meet: [['me', 'Sure! …What are you doing out here?'], ['o', 'I\'m an account manager at a software company. We sell security services — we watch a company\'s network, stop attacks, and stay with them when something happens.'], ['o', 'Early tomorrow I take the high-speed train to Taichung for the final presentation to a precision-machinery maker. I\'ve followed this deal for eight months.'], ['me', 'Eight months! Wow… are you nervous?'], ['o', 'I am. Their CISO is strict — always the hardest questions. So I sit on this lawn and say my answers out loud, one by one.'], ['o', 'Hey — would you play my CISO for a minute? I\'ll read the questions; you pick the best answer.']],
    olw_meetD: [['o', 'Oh? You\'re… the one from Daan Forest Park! You talked pasta with me.'], ['me', 'That\'s me! No suit today?'], ['o', 'Off the clock. The cardigan and jeans are the real me. (laughs)'], ['o', 'Early tomorrow I take the high-speed train to Taichung for the final presentation to a precision-machinery maker. Eight months on this deal.'], ['me', 'Eight months! Nervous?'], ['o', 'I am. Their CISO is strict. Hey — would you play my CISO for a minute? I\'ll read the questions; you pick the best answer.']],
    olw_again: [['o', 'Rehearse with me once more? Just three questions.']],
    olw_rehHi: [['o', 'Thank you. Saying it out loud settles me.'], ['me', 'You\'ll be great tomorrow!'], ['o', 'Mm! I\'ll tell you how it went. Go and look around — come and find me later.']],
    olw_rehLo: [['o', 'Ha — you\'re a strict CISO! Good, though. Miss it once and you remember it.'], ['me', 'Ehehe… I learned a lot too!'], ['o', 'Tomorrow I\'ll make every answer more solid. I\'ll tell you how it goes!']],
    olw_eve: [
      [['o', 'Still here. I\'m memorising my opening line: "We don\'t sell fear. We sell the phone call when something happens."'], ['me', 'That\'s so cool!'], ['o', 'Lots of news this week — they\'ll ask. An Indian certificate authority had its keys stolen, and browsers and Python rushed to block its certificates.'], ['o', 'I\'ll remind them: update not only the operating system, but the certificate stores their software carries too.']],
      [['o', 'This week a Taiwanese e-commerce service platform\'s database was accessed illegally, and the Ministry of Digital Affairs has started an inspection.'], ['o', 'Next come fake refund emails. If one says "click to get your refund", don\'t click.'], ['me', 'I-I\'ll be careful!']],
      [['me', 'Your watch is pretty.'], ['o', 'Thanks! It\'s my secret weapon — it buzzes every ten minutes to remind me to stop and ask the client a question.'], ['o', 'I\'m not afraid of being stumped. I\'m afraid of talking too fast.'], ['me', 'I see!'], ['o', 'And it counts steps. Four clients today — twelve thousand.']],
      [['o', 'When the presentation\'s done I\'m having a plate of pasta. Clams in white wine, garlic fried golden.'], ['me', 'Luna wants some too!'], ['o', 'Then it\'s a deal: if we win, it\'s on me. (laughs)']]],
    olw_txg: [['o', 'You were in Taichung today too? We might have passed each other at the station!']],
    olw_win: [['o', 'Luna! I\'ve been waiting for you — we signed! The client chose us for three years of monitoring!'], ['me', 'Really?! That\'s wonderful — congratulations!'], ['o', 'The CISO said they chose us because we didn\'t promise to "block everything" — we explained exactly how we\'d handle it together.'], ['o', 'That was the first question you rehearsed with me. Half the credit is yours.'], ['o', 'Here — my card. If your sites ever need a security check-up, call me.']],
    olw_hold: [['o', 'Luna! The result\'s in — the client extended the POC by a month to compare again.'], ['me', 'Oh… so it didn\'t work?'], ['o', 'Not lost yet! The CISO said our response process was the clearest; they just want to see us run a live drill. The first rule of sales: don\'t give up.'], ['o', 'Thank you for rehearsing with me. Here\'s my card — you\'ll be the first to hear good news.']],
    olw_chat: [
      [['o', 'Writing a quote out here again. The lawn is quieter than the office, and I can see the station\'s great roof.'], ['me', 'The station looks so grand from here!'], ['o', 'When I first came to Taipei for job interviews, I sat right here waiting. That roof felt enormous — like anything could happen.']],
      [['o', 'A little homework for you: turn on automatic updates on your phone and computer, and use passkeys or two-step verification for important accounts.'], ['me', 'Passkeys?'], ['o', 'You sign in with your phone\'s fingerprint or face — no password to remember, and a fake site can\'t trick it out of you.']],
      [['o', 'This week the IETF published the standard for hybrid post-quantum key exchange in TLS 1.3, and Taiwan\'s financial regulator is discussing the order banks should migrate in.'], ['me', 'Post… quantum? Sounds so futuristic!'], ['o', 'The future\'s closer than you think. Encrypted data stolen today could be cracked in ten years — so the change starts now.']],
      [['o', 'The payment-card security standards body just issued AI guidance: an AI agent needs human approval before it touches cardholder data in the clear.'], ['me', 'Just like you said — judgement to people!'], ['o', 'Right? It\'s already in my slides.']],
      [['o', 'People think sales is all dinners and drinks. Mostly I listen — to what the client is worried about.'], ['o', 'And answer emails. Lots and lots of emails.'], ['me', 'Thank you for working so hard… Luna\'s cheering for you!'], ['o', 'That\'s all I need. Thank you.']]],
    olw_chatWin: [['o', 'The machinery maker starts the roll-out next week. I\'m syncing schedules with their engineers every day — busy, but happy.'], ['me', 'Your smile\'s even brighter than usual!']] });
  Object.assign(GD.ja, {
    olw_meet: [['me', 'うん！……お姉さん、ここで何してるの？'], ['o', 'ソフトウェア会社で営業をしてるの。売ってるのはセキュリティサービス。企業のネットワークを見張って、攻撃を止めて、何かあった時は一緒に対応する。'], ['o', '明日の朝、高鉄で台中に行って、精密機械メーカーに最終プレゼン。この案件、八か月追いかけてきたの。'], ['me', '八か月！すごい……緊張する？'], ['o', 'するよ。先方の CISO は厳しくて、いつも一番難しい質問をしてくる。だからこの芝生に座って、答えを一つずつ声に出すのが習慣なの。'], ['o', 'ねえ、少しだけ私の CISO になってくれない？ 私が質問を読むから、一番いい答えを選んで。']],
    olw_meetD: [['o', 'あれ？ あなた……大安森林公園の！ パスタの話をした子ね。'], ['me', 'そうです！ 今日はスーツじゃないんだ。'], ['o', '仕事終わりだもの。カーディガンとジーンズが本当の私。（笑）'], ['o', '明日の朝、高鉄で台中に行って、精密機械メーカーに最終プレゼン。八か月追いかけた案件なの。'], ['me', '八か月！ 緊張する？'], ['o', 'するよ。先方の CISO は厳しいの。ねえ、少しだけ私の CISO になってくれない？ 質問を読むから、一番いい答えを選んで。']],
    olw_again: [['o', 'もう一回リハーサルに付き合ってくれる？ 三問だけ。']],
    olw_rehHi: [['o', 'ありがとう。声に出したら、気持ちが落ち着いた。'], ['me', 'お姉さん、明日はきっと大丈夫！'], ['o', 'うん！ 結果が出たら教えるね。先に街を回ってきて、あとでまた来て。']],
    olw_rehLo: [['o', 'ふふ、厳しい CISO ね！ でもちょうどいい。一度間違えたら忘れないもの。'], ['me', 'えへへ……わたしも勉強になった！'], ['o', '明日は全部の答えをもっと確かに話す。結果が出たら教えるね！']],
    olw_eve: [
      [['o', 'まだここにいるよ。冒頭の一言を暗記中。「私たちは恐怖を売りません。何かあった時の、その一本の電話を売ります」'], ['me', 'かっこいい！'], ['o', '今週はニュースが多いから、きっと聞かれる。インドの認証局の鍵が盗まれて、ブラウザも Python も急いでその証明書を遮断したの。'], ['o', 'OS だけじゃなく、ソフトが自分で持っている証明書ストアも更新して、って伝えるつもり。']],
      [['o', '今週、台湾の EC サービス基盤のデータベースが不正アクセスを受けて、数位発展部が行政検査を始めたの。'], ['o', '次は偽の返金メールが来る。「リンクを押して返金」なんて来ても、絶対に押さないでね。'], ['me', 'き、気をつける！']],
      [['me', 'お姉さんの時計、すてき。'], ['o', 'ありがとう！ 実は秘密兵器なの。十分ごとに震えて、話すのを止めてお客様に質問するよう教えてくれる。'], ['o', '怖いのは言葉に詰まることじゃなくて、早口になること。'], ['me', 'なるほど！'], ['o', '歩数も数えてくれるの。今日はお客様四社、一万二千歩。']],
      [['o', 'プレゼンが終わったら、パスタを食べに行くの。ボンゴレ・ビアンコ、ニンニクは黄金色に。'], ['me', 'ルナも食べたい！'], ['o', 'じゃあ約束。案件が決まったら、ごちそうするね。（笑）']]],
    olw_txg: [['o', '今日、あなたも台中に行ってたの？ 駅ですれ違ってたかも！']],
    olw_win: [['o', 'ルナ！ 待ってたの――契約できた！ 三年間の監視サービスに決まったの！'], ['me', 'ほんと？ やったね、おめでとう！'], ['o', 'CISO が言ってた。選んだ理由は、「全部防ぐ」と言わずに、何かあった時どう一緒に対処するかをはっきり説明したからだって。'], ['o', 'それ、あなたと練習した一問目。手柄の半分はあなたのもの。'], ['o', 'はい、私の名刺。現場でセキュリティ診断が必要になったら、電話して。']],
    olw_hold: [['o', 'ルナ！ 結果が出たの。お客様は POC を一か月延ばして、もう一度比べるって。'], ['me', 'あ……だめだったの？'], ['o', 'まだ負けてないよ！ CISO は、うちの対応プロセスが一番わかりやすいって。実地訓練を一度見たいだけ。営業で一番大事なのは、あきらめないこと。'], ['o', '練習に付き合ってくれてありがとう。はい、名刺。いい知らせは一番に教えるね。']],
    olw_chat: [
      [['o', '今日もここで見積書を書いてるの。芝生はオフィスより静かだし、駅の大きな屋根が見えるから。'], ['me', 'ここから見る駅、すごく立派！'], ['o', '初めて台北に就職活動で来た時も、ここに座って面接を待ってたの。あの屋根がすごく大きく見えて、何でも起こりそうな気がした。']],
      [['o', '小さな宿題をあげる。スマホとパソコンは自動更新をオンに、大事なアカウントはパスキーか二段階認証に。'], ['me', 'パスキー？'], ['o', 'スマホの指紋や顔でログインするの。パスワードを覚えなくていいし、偽サイトにだまし取られることもない。']],
      [['o', '今週、IETF が TLS 1.3 のハイブリッド耐量子鍵交換の標準を出したの。台湾の金融監督当局も、銀行が移行する順番を議論してる。'], ['me', '耐……量子？ 未来っぽい！'], ['o', '未来は思ったより近いよ。今盗まれた暗号データが十年後に解読されるかもしれない。だから今から替えていくの。']],
      [['o', '決済カード業界のセキュリティ基準団体が AI の指針を出したの。AI エージェントが平文のカード会員データに触れる前に、人の承認が必要だって。'], ['me', 'お姉さんがあの日言ってたのと同じ！ 判断は人に！'], ['o', 'でしょ？ もうプレゼン資料に入れたよ。']],
      [['o', '営業って毎日接待ばかりだと思われがち。でも一番多いのは聞くこと。お客様が何を心配しているか。'], ['o', 'それとメールの返信。たくさん、たくさん。'], ['me', 'おつかれさま……ルナが応援してる！'], ['o', 'その一言で十分。ありがとう。']]],
    olw_chatWin: [['o', 'あの機械メーカー、来週から導入開始。毎日エンジニアとスケジュール合わせで忙しいけど、楽しいの。'], ['me', 'お姉さんの笑顔、いつもよりまぶしい！']] });
  Object.assign(GX.zh, { c_ol: OLWX.zh.contact, n_o: OLWX.zh.contact }); Object.assign(GX.en, { c_ol: OLWX.en.contact, n_o: OLWX.en.contact }); Object.assign(GX.ja, { c_ol: OLWX.ja.contact, n_o: OLWX.ja.contact });
  var _phAvW = phAv; phAv = function (id) { return id === 'ol' ? '業' : _phAvW(id); };

  /* Luna's own two lines with her (VOICEVOX, original): on meeting her on the lawn, and on the good news */
  Object.assign(FSL, { ol_hi: ['わぁ、芝生、気持ちよさそう！'], ol_win: ['やったね！ おめでとう！'] });
  Object.assign(FSX.zh.mean, { ol_hi: '「哇，草地看起來好舒服！」', ol_win: '「太好了！恭喜！」' }); Object.assign(FSX.en.mean, { ol_hi: '"Wow, the grass looks so comfy!"', ol_win: '"You did it! Congratulations!"' }); if (FSX.ja && FSX.ja.mean) Object.assign(FSX.ja.mean, { ol_hi: '「わぁ、芝生、気持ちよさそう！」', ol_win: '「やったね！ おめでとう！」' });
  function olwSay(id) { try { if (!(typeof DXO !== 'undefined' && DXO.bz)) VOICE.say(id); fsSub(id); } catch (e) {} }

  /* ---------- the lawn, its trees and lamps, her things; she herself ---------- */
  var OLW = { A: null, n: null, G: null, at: null, ry: 0, waveT: 0, greeted: false, grass: null, lamps: [], t: 0, tufts: null };
  function olwState() { P.olw = P.olw || { ch: 0, k: -1, score: 0, t1: 0, away: false, txg: false }; return P.olw; }
  var LAWN = { x0: 63.5, x1: 90.5, z0: 62, z1: 92, at: [70.4, 80.6] };
  function olwGrassTex() { var c = document.createElement('canvas'); c.width = c.height = 256; var g = c.getContext('2d'), s0 = 41; function r() { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }
    g.fillStyle = '#5e8a3c'; g.fillRect(0, 0, 256, 256); for (var i = 0; i < 5200; i++) { var x = r() * 256, y = r() * 256, l = 2 + r() * 5, a = -Math.PI / 2 + (r() - 0.5) * 0.9, k = r(); g.strokeStyle = k < 0.33 ? 'rgba(46,82,32,0.55)' : k < 0.66 ? 'rgba(120,160,72,0.45)' : 'rgba(150,186,92,0.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; }
  function olwBuild(C) { var T = C.T, H = TPE3D.H, K = H.K(), M = H.M(), KT = H.kit(), X = C.x, Z = C.z, Y = C.y, Y1 = T.Y1, lo = TIER === 'low', L = LAWN;
    var G = new THREE.Group(); G.name = 'olwLawn'; T.root.add(G); OLW.G = G;
    function col(x0, x1, z0, z1, y0, y1) { T.colliders.push([X + (x0 + x1) / 2, Z + (z0 + z1) / 2, Math.abs(x1 - x0) / 2, Math.abs(z1 - z0) / 2, y0 == null ? -1 : y0, y1 == null ? 3 : y1]); }
    function gw(x, y, z, r, k) { var g = [X + x, Y + y, Z + z, r, k || 1]; T.glows.push(g); (W.glows = W.glows || []).push(g); }
    /* the lawn: a grid of grass, mown in broad stripes (lighter and darker bands), its granite edging flush with the paving */
    var nx = 27, nz = 30, gg = new THREE.PlaneGeometry(L.x1 - L.x0, L.z1 - L.z0, nx, nz); gg.rotateX(-Math.PI / 2); var pa = gg.attributes.position, cl = [], i;
    for (i = 0; i < pa.count; i++) { var px = pa.getX(i), pz = pa.getZ(i), band = Math.floor((px + (L.x1 - L.x0) / 2) / 2.7) % 2, edge = Math.min(Math.abs(px) - (L.x1 - L.x0) / 2, Math.abs(pz) - (L.z1 - L.z0) / 2), k = (band ? 1.06 : 0.94) * (1 - 0.08 * Math.max(0, 1 + edge / 1.2)); cl.push(k, k, k); }
    gg.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3)); var uv = gg.attributes.uv; for (i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (L.x1 - L.x0) / 3.2, uv.getY(i) * (L.z1 - L.z0) / 3.2);
    var gm = new THREE.MeshStandardMaterial({ map: olwGrassTex(), vertexColors: true, roughness: 0.96, metalness: 0 }); KIT.curved(gm); if (KIT.llights) KIT.llights(gm); if (KIT.seasonal) KIT.seasonal(gm);
    var lawn = new THREE.Mesh(gg, gm); lawn.position.set((L.x0 + L.x1) / 2, Y1 + 0.022, (L.z0 + L.z1) / 2); lawn.receiveShadow = true; G.add(lawn); OLW.grass = lawn;
    var B = { paint: K.Batch(), mat: K.Batch(), dark: K.Batch(), glow: K.Batch() };
    [[L.x0 - 0.22, L.x1 + 0.22, L.z0 - 0.22, L.z0], [L.x0 - 0.22, L.x1 + 0.22, L.z1, L.z1 + 0.22], [L.x0 - 0.22, L.x0, L.z0, L.z1], [L.x1, L.x1 + 0.22, L.z0, L.z1]].forEach(function (q) { H.bx(B.paint, q[0], q[1], Y1, Y1 + 0.035, q[2], q[3], 0xb4b0a6); });
    /* tufts: blades in little fans near where she sits (the near ground reads as grass, not paint) */ var tr = (function () { var s0 = 77; return function () { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; })(), nT = lo ? 260 : 900;
    for (i = 0; i < nT; i++) { var ang = tr() * Math.PI * 2, rr = Math.sqrt(tr()) * 7.5, tx = L.at[0] + Math.cos(ang) * rr, tz = L.at[1] + Math.sin(ang) * rr; if (tx < L.x0 + 0.3 || tx > L.x1 - 0.3 || tz < L.z0 + 0.3 || tz > L.z1 - 0.3) continue; if (Math.hypot(tx - L.at[0], tz - L.at[1]) < 0.55) continue;
      for (var bl = 0; bl < 3; bl++) { var a2 = tr() * Math.PI, h = 0.05 + tr() * 0.07, w = 0.012 + tr() * 0.008, lean = (tr() - 0.5) * 0.5, tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-w, 0, 0, w, 0, 0, lean * h, h, 0], 3)); tri.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0.2, 0.98, 0], 3)); /* lit as the lawn is: the normals up */
        B.mat.add(tri, { p: [tx + (tr() - 0.5) * 0.06, Y1 + 0.02, tz + (tr() - 0.5) * 0.06], r: [0, a2, 0] }, [0x6a9a44, 0x78a84c, 0x86b456, 0x5e8e3e][(tr() * 4) | 0]); } }
    /* the camphor trees: a trunk forking into limbs, a crown of overlapping leaf clusters, lighter on top */
    function tree(x, z, h, seed) { var r = (function () { var s0 = seed; return function () { s0 = (s0 * 16807) % 2147483647; return (s0 - 1) / 2147483646; }; })(), trw = 0.1 + h * 0.022; B.mat.add(K.cyl(trw * 0.75, trw * 1.3, h * 0.48, 10), { p: [x, Y1 + h * 0.24, z] }, 0x5a4a3c); var limbs = [];
      for (var k = 0; k < 4; k++) { var a = k * 1.57 + r() * 0.7, Lm = h * (0.28 + r() * 0.1), ex = x + Math.sin(a) * Lm * 0.6, ez = z + Math.cos(a) * Lm * 0.6, ey = Y1 + h * (0.6 + r() * 0.12); KT.cylAB(B.mat, [x, Y1 + h * 0.45, z], [ex, ey, ez], trw * 0.5, 0x5a4a3c, 6); limbs.push([ex, ey, ez]); }
      var N = lo ? 9 : 14, G0 = [0x2f5a2c, 0x3a6a32, 0x46763a, 0x2a4f28, 0x52803e]; for (var j = 0; j < N; j++) { var lb = limbs[j % 4], rr2 = h * (0.15 + r() * 0.09), ox = (r() - 0.5) * h * 0.36, oz = (r() - 0.5) * h * 0.36, oy = (r() - 0.3) * h * 0.14;
        B.mat.add(new THREE.IcosahedronGeometry(rr2, lo ? 0 : 1), { p: [lb[0] + ox, lb[1] + oy + rr2 * 0.3, lb[2] + oz], s: [1, 0.74, 1] }, (function (base) { return function (px2, py2, pz2, nx2, ny2) { var c = new THREE.Color(base); c.offsetHSL(0, 0, (ny2 > 0.3 ? 0.06 : ny2 < -0.3 ? -0.08 : 0) + (r() - 0.5) * 0.04); return c; }; })(G0[j % G0.length])); }
      col(x - 0.3, x + 0.3, z - 0.3, z + 0.3, -1, 4); }
    tree(74.6, 82.4, 9.6, 3301); tree(84.4, 70.2, 8.4, 3302); tree(83.2, 88.6, 7.6, 3303);
    /* low garden lamps: a dark post, a warm head that lights the lawn (and her face) at night */
    [[68.2, 78.4], [72.6, 76.2], [79.5, 82.5], [86.8, 77.5]].forEach(function (q) { H.cylY(B.dark, q[0], Y1, Y1 + 0.82, q[1], 0.06, 0x2e3236, 8); H.bx(B.dark, q[0] - 0.11, q[0] + 0.11, Y1 + 0.82, Y1 + 0.86, q[1] - 0.11, q[1] + 0.11, 0x2a2e32); H.bx(B.glow, q[0] - 0.085, q[0] + 0.085, Y1 + 0.66, Y1 + 0.82, q[1] - 0.085, q[1] + 0.085, 0xffe4b8); col(q[0] - 0.1, q[0] + 0.1, q[1] - 0.1, q[1] + 0.1, -1, 1.2); gw(q[0], Y1 + 0.75, q[1], 5, 0.55); });
    [[B.paint, M.paint], [B.mat, M.mat], [B.dark, M.dark], [B.glow, M.glow]].forEach(function (q) { if (q[0].count()) G.add(q[0].mesh(q[1], { cast: q[1] !== M.glow && q[0] !== B.paint, recv: true })); });
    /* at night, warm pools of light on the grass round the lamps (additive, a soft radial falloff) */ var pc = document.createElement('canvas'); pc.width = pc.height = 64; var pg = pc.getContext('2d'), rg = pg.createRadialGradient(32, 32, 1, 32, 32, 32); rg.addColorStop(0, 'rgba(255,255,255,0.95)'); rg.addColorStop(0.4, 'rgba(255,255,255,0.4)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); pg.fillStyle = rg; pg.fillRect(0, 0, 64, 64);
    var PB = K.Batch({ uv: true }), FR = { u0: 0, v0: 0, u1: 1, v1: 1 }; [[68.2, 78.4, 4.6], [72.6, 76.2, 4.6], [79.5, 82.5, 4.6], [86.8, 77.5, 4.6]].forEach(function (q) { var pl = new THREE.PlaneGeometry(q[2], q[2]); pl.rotateX(-Math.PI / 2); PB.add(pl, { p: [q[0], Y1 + 0.05, q[1]] }, new THREE.Color(0xffc890).multiplyScalar(0.22), { uvRect: FR }); });
    var pm = PB.mesh(KIT.curved(new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(pc), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, polygonOffset: true, polygonOffsetFactor: -2 })), { cast: false, recv: false }); pm.renderOrder = 2; pm.visible = false; G.add(pm); OLW.pools = pm;
    /* she: seated on the lawn, facing across the plaza towards the station's south gates */
    if (typeof MAX === 'undefined' || !MAX.buildOL) return; var A = MAX.buildOL({ seed: 7, look: 'casual' }); A.root.scale.setScalar(A.isAnime ? 1.16 : 1.06); A.root.rotation.order = 'YXZ';
    var at = L.at, ry = Math.atan2(28 - at[0], 66 - at[1]); A.root.position.set(at[0], Y1 + 0.022, at[1]); A.root.rotation.y = ry; G.add(A.root); LUNA.setMode(A, 'lawn'); if (lo) A.root.traverse(function (m) { if (m.isMesh) m.castShadow = false; });
    /* her things on the grass: the laptop tote at her right (the laptop's edge showing), the coffee at her left */ var pr = new THREE.Group(); A.root.add(pr); if (A.isAnime) pr.scale.setScalar(1.06 / 1.16); /* her things keep their size */ var TO = function (h, o) { return LUNA.toon(h, Object.assign({ rim: 0.18 }, o || {})); };
    var tote = LUNA.mesh(LUNA.rbox(0.29, 0.23, 0.085, 0.026, 3), TO(0xb48a5a), { ink: 0.0016 }); tote.position.set(-0.4, 0.115, -0.02); tote.rotation.set(0, 0.35, 0.06); pr.add(tote);
    var lap = LUNA.mesh(LUNA.rbox(0.24, 0.17, 0.016, 0.005, 2), TO(0x8a8e94, { rim: 0.4 }), { ink: 0.001 }); lap.position.set(-0.41, 0.2, -0.015); lap.rotation.set(0, 0.35, 0.06); pr.add(lap);
    [-1, 1].forEach(function (s) { var hd = LUNA.mesh(LUNA.taper(new THREE.CatmullRomCurve3([new THREE.Vector3(-0.09, 0, 0), new THREE.Vector3(-0.05, 0.11, 0), new THREE.Vector3(0.05, 0.11, 0), new THREE.Vector3(0.09, 0, 0)]), 14, 5, function () { return 0.008; }, { flat: 0.45 }), TO(0x8e6438), { ink: 0.0008 }); hd.position.set(-0.4 + s * 0.01, 0.23, -0.02 + s * 0.038); hd.scale.setScalar(0.85); hd.rotation.set(0, 0.35, 0.06); pr.add(hd); });
    var cup = LUNA.mesh(new THREE.CylinderGeometry(0.036, 0.029, 0.12, 18), TO(0xf2efe8), { ink: 0.001 }); cup.position.set(0.3, 0.06, 0.06); pr.add(cup); var slv = LUNA.mesh(new THREE.CylinderGeometry(0.0368, 0.0335, 0.045, 18, 1, true), TO(0x9a6c40), { ink: false }); slv.position.set(0.3, 0.055, 0.06); pr.add(slv); var lid = LUNA.mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.01, 18), TO(0xfafaf8), { ink: 0.0008 }); lid.position.set(0.3, 0.125, 0.06); pr.add(lid);
    LUNA.curvedAll(pr); col(at[0] - 0.55, at[0] + 0.55, at[1] - 0.55, at[1] + 0.55, -1, 1.4);
    OLW.A = A; OLW.at = at; OLW.ry = ry; for (i = 0; i < 40; i++) LUNA.update(A, 1 / 30, { lawn: {} }); }
  var _tpBuildW = tpBuild; tpBuild = function () { var first = !CITY.taipei, C = _tpBuildW.apply(this, arguments); if (first && C && C.T) { try { olwBuild(C); } catch (e) { if (window.console) console.error('taipei lawn', e); if (window.ISLE_TEST) throw e; } } return C; };
  /* the street play of Taipei: she is one of the people who talk */
  var _gsBuildCityW = gsBuildCity; gsBuildCity = function () { _gsBuildCityW.apply(this, arguments); if (!TK || TK.id !== 'taipei' || !OLW.A) return; OLW.n = { A: OLW.A, kind: 'olw', home: [OLW.at[0], OLW.at[1], OLW.ry, OLW.A.root.position.y], talk: 'ol', tr: 3.4, stay: true, seat: true }; GS.talkers = (GS.talkers || []).concat([OLW.n]); };

  /* ---------- her story ---------- */
  function olwPick(sets, key) { var S = olwState(), k = S[key] = ((S[key] == null ? -1 : S[key]) + 1) % Math.max(1, sets.length); return sets[k] || []; }
  function olwTalk(n) { var S = olwState(), A = n.A; thread('ol', 'o', '#b5895a'); OLW.waveT = 1.6; LUNA.expr(A, 'happy', 1.8); var greet = ['o', olw(isNight() ? 'hiN' : 'hiD')];
    if (S.ch === 0) { var first = !S.asked; S.asked = true; save(); phSeq('ol', first ? [greet].concat(gd(P.stamps['ol.daan'] ? 'olw_meetD' : 'olw_meet')) : gd('olw_again'), function () { setTimeout(function () { olwRehearse(0, 0, []); }, 650); }, true); if (first) setTimeout(function () { olwSay('ol_hi'); }, 400); return; }
    if (S.ch === 1) { if (S.away || Date.now() - (S.t1 || 0) > 240000) { S.ch = 2; save(); var L = (S.txg ? gd('olw_txg') : []).concat(gd(S.score >= 2 ? 'olw_win' : 'olw_hold')); phSeq('ol', L, function () { setTimeout(olwCard, 600); }, true); if (S.score >= 2) setTimeout(function () { olwSay('ol_win'); }, 2600); return; }
      phSeq('ol', olwPick(gd('olw_eve'), 'k'), null, true); return; }
    var sets = gd('olw_chat').slice(); if (S.score >= 2) sets.push(gd('olw_chatWin')); phSeq('ol', olwPick(sets, 'kc'), null, true); }
  var _cityTalkW = cityTalk; cityTalk = function (it) { if (!TK || TK.id !== 'taipei' || it.id !== 'ol') return _cityTalkW(it); olwTalk(it.n); };
  /* the rehearsal card: one question at a time; the answers shuffled; her word on the one chosen; the score at the end */
  function olwRehearse(qi, score, picked) { if (!gsOn()) return; phClose(); var Q = (OLWQ[LANG] || OLWQ.zh)[qi], ord = [0, 1, 2].sort(function () { return Math.random() - 0.5; }), done = false;
    var C = card('<p class="isle__kick2">' + esc(olw('cardK')) + ' · ' + esc(olw('rehK')) + '</p><h2>' + esc(f(olw('rehT'), { n: qi + 1 })) + '</h2><p class="isle__pitch">' + esc(olw('rehQ')) + '</p><p class="isle__olq">' + esc(Q.q) + '</p><div class="isle__opts">' + ord.map(function (k, j) { return '<button type="button" class="isle__opt" data-a="' + k + '"><i>' + 'ABC'[j] + '</i><span>' + esc(Q.a[k]) + '</span></button>'; }).join('') + '</div><p class="isle__why" id="isOlqR" hidden></p><div class="isle__cact"><button type="button" class="isle__btn isle__btn--go" id="isOlqN" hidden><b>' + esc(qi < 2 ? olw('next') : olw('done')) + '</b></button></div>', 'isle__cin--olq');
    [].forEach.call(C.querySelectorAll('[data-a]'), function (b) { b.addEventListener('click', function () { if (done) return; done = true; var k = +b.getAttribute('data-a'), ok = k === 0; if (ok) score++; picked.push(k);
      [].forEach.call(C.querySelectorAll('[data-a]'), function (b2) { var k2 = +b2.getAttribute('data-a'); if (k2 === 0) b2.classList.add('is-ok'); else if (b2 === b) b2.classList.add('is-bad'); b2.disabled = true; });
      var R = $('isOlqR'); R.hidden = false; R.textContent = Q.r[k]; AU.fx(ok ? 'ok' : 'bad'); if (OLW.A) LUNA.expr(OLW.A, ok ? 'happy' : 'half', 1.4); var N = $('isOlqN'); N.hidden = false; N.focus(); }); });
    $('isOlqN').addEventListener('click', function () { if (qi < 2) { cardClose(); olwRehearse(qi + 1, score, picked); return; } olwRehDone(score); }); }
  function olwRehDone(score) { var S = olwState(); S.score = score; S.ch = 1; S.t1 = Date.now(); S.away = false; S.txg = false; S.k = -1; save();
    var C = card('<p class="isle__kick2">' + esc(olw('cardK')) + ' · ' + esc(olw('rehK')) + '</p><h2>' + esc(f(olw('score'), { n: score })) + ' / 3</h2><p class="isle__why">' + esc(olw(score >= 3 ? 's3' : score === 2 ? 's2' : score === 1 ? 's1' : 's0')) + '</p><div class="isle__cact"><button type="button" class="isle__btn isle__btn--go" id="isOlqD"><b>OK</b></button></div>', 'isle__cin--olq');
    $('isOlqD').addEventListener('click', function () { cardClose(); }); cardClose.after = function () { phSeq('ol', gd(score >= 2 ? 'olw_rehHi' : 'olw_rehLo'), null, true); }; AU.fx(score >= 2 ? 'stamp' : 'ok'); }
  /* her card: the role, the city, a line by hand on the back; coins with it */
  function olwCard() { if (!gsOn()) return; phClose(); var S = olwState(), coins = S.score >= 2 ? 60 : 40;
    var C = card('<p class="isle__kick2">' + esc(olw('cardK')) + '</p><h2>' + esc(olw('cardT')) + '</h2><p class="isle__pitch">' + esc(olw('cardP')) + '</p><div class="isle__bcard" aria-hidden="true"><div class="isle__bcard-f"><i></i><b>' + esc(olw('cardRole')) + '</b><small>' + esc(olw('cardCity')) + '</small></div><div class="isle__bcard-b"><em>' + esc(olw('cardNote')) + '</em></div></div><div class="isle__cact"><button type="button" class="isle__btn isle__btn--go" id="isOlcG"><b>' + esc(olw('cardGot')) + '</b></button></div>', 'isle__cin--olq');
    $('isOlcG').addEventListener('click', function () { cardClose(); }); cardClose.after = function () { if (S.card) return; S.card = true; S.ch = 3; P.coins += coins; P.stamps['tpe.ol'] = 1; save(); hud(); toast(f(olw('cardToast'), { c: coins }), 'stamp'); AU.fx('coin'); LUNA.setMode(luna, 'cheer'); setTimeout(function () { if (luna.mode === 'cheer') LUNA.setMode(luna, 'idle'); }, 1400); }; }
  /* the day passes elsewhere: leaving Taipei (or arriving in Taichung) after the rehearsal brings the result on the next visit */
  var _cityArriveW = cityArrive; cityArrive = function (id) { var S = P.olw; if (S && S.ch === 1 && id !== 'taipei') { S.away = true; if (id === 'taichung') S.txg = true; save(); } return _cityArriveW.apply(this, arguments); };
  var _cityLeaveW = cityLeave; cityLeave = function () { var S = P.olw; if (S && S.ch === 1 && TK && TK.id === 'taipei') { S.away = true; save(); } return _cityLeaveW.apply(this, arguments); };
  /* the meeting on the bench in Daan Forest Park is remembered (she knows Luna on the lawn) */
  var _fxOlW = FX_TALK.ol; FX_TALK.ol = function (n) { P.stamps['ol.daan'] = 1; save(); return _fxOlW(n); };

  /* ---------- she lives a little: a breath, a glance at Luna when she is near, a wave on meeting; the outline rests at a distance ---------- */
  var OLWV = new THREE.Vector3();
  function olwTick(dt) { if (!OLW.A || !TK || TK.id !== 'taipei' || !CITYW) return; var A = OLW.A; A.root.getWorldPosition(OLWV); var dc = Math.hypot(cam.position.x - OLWV.x, cam.position.z - OLWV.z), near = dc < 75; OLW.G.visible = near; if (!near) return;
    var dl = Math.hypot(pos.x - OLWV.x, pos.z - OLWV.z), look = 0; if (dl < 7) { var la = Math.atan2(pos.x - OLWV.x, pos.z - OLWV.z) - A.root.rotation.y; while (la > Math.PI) la -= Math.PI * 2; while (la < -Math.PI) la += Math.PI * 2; look = Math.max(-0.85, Math.min(0.85, la)); }
    if (dl < 6.5 && !OLW.greeted) { OLW.greeted = true; OLW.waveT = 1.8; LUNA.expr(A, 'happy', 2.0); } if (dl > 14) OLW.greeted = false;
    if (OLW.pools) OLW.pools.visible = (KIT.U.uNight ? KIT.U.uNight.value : 0) > 0.12;
    if (OLW.waveT > 0) OLW.waveT -= dt; LUNA.update(A, dt, { lawn: { wave: OLW.waveT > 0 }, look: look }); MAX.lod(A, dc); }
  var _extraTickW = extraTick; extraTick = function (dt, ts) { _extraTickW(dt, ts); try { olwTick(dt); } catch (e) { if (window.ISLE_TEST) throw e; } };

  /* ---------- the navigation knows where she is ---------- */
  var _navListW = navList; navList = function () { var out = _navListW.apply(this, arguments); if (!TK || TK.id !== 'taipei' || !OLW.A) return out; var loc = navNpc(TK.T, OLW.A); if (!loc) return out; var o = { id: 'ol', cat: 'people', nm: olw('contact'), sub: olw('navS'), L: loc.L || loc }; if (loc.face) o.face = loc.face;
    var k = -1; out.forEach(function (q, i) { if (q.cat === 'people') k = i; }); out.splice(k + 1, 0, o); return out; };

  window.ISLE_x.olw = function (cmd, a) { var S = olwState(); if (cmd === 'state') return JSON.parse(JSON.stringify(S)); if (cmd === 'reset') { P.olw = null; olwState(); save(); return true; } if (cmd === 'talk') { if (OLW.n) cityTalk({ n: OLW.n, id: 'ol' }); return !!OLW.n; } if (cmd === 'card') { olwCard(); return !!cardOn; } if (cmd === 'reh') { olwRehearse(0, 0, []); return !!cardOn; } if (cmd === 'away') { S.away = true; save(); return true; } if (cmd === 'pos') { if (!OLW.A) return null; OLW.A.root.getWorldPosition(OLWV); return [OLWV.x, OLWV.y, OLWV.z, OLW.A.root.rotation.y]; } if (cmd === 'bake') return OLW.A ? OLW.A.bake : null; return null; };


