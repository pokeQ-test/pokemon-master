let timer;
let timeLeft = 20;
let currentPokemon = "";
let currentPokemonId = 0;
let currentAcceptedAnswers = [];
let currentAnswerPokemonIds = [];
let loadRequestId = 0;
let isQuestionActive = false;
let answeredQuestions = 0;
let correctAnswers = 0;
let quizFinished = false;
let quizPokemonIds = [];
let usedPokemonIds = [];
let quizAction = "start";
let currentDexDetailId = 1;
let currentCombo = 0;
let comboToastTimer;
let currentStatName = "";
let currentStatValue = 0;
let statQuizPoints = 0;

const foundPokemon =
JSON.parse(
localStorage.getItem("foundPokemon")
) || [];

const foundPokemonMeta =
JSON.parse(
localStorage.getItem("foundPokemonMeta")
) || {};

const generationRanges = {
    1: [1, 151],
    2: [152, 251],
    3: [252, 386],
    4: [387, 493],
    5: [494, 649],
    6: [650, 721],
    7: [722, 809],
    8: [810, 905],
    9: [906, 1025]
};

const typePokemonCache = {};
const speciesCache = {};
const pokemonDataCache = {};
const evolutionChainCache = {};
const evolutionRelationCache = {};

// 2026年6月時点の対戦環境を想定した初期リスト。
// 公式の公開Web APIが確認できないため、更新時はこの配列だけを差し替える。
const championsUsageTop100 = [
    1007,1008,898,888,889,1024,1000,991,987,1002,
    1003,1004,1017,1020,1021,1022,1023,645,642,641,
    905,382,383,384,483,484,487,493,643,644,
    646,716,717,800,791,792,890,150,249,250,
    485,488,598,812,727,876,591,778,445,149,
    248,376,373,700,282,475,448,658,784,887,
    998,959,964,977,978,983,970,980,975,934,
    911,908,914,815,818,823,869,858,861,879,
    882,892,894,895,897,896,468,479,472,473,
    462,461,423,407,350,330,260,257,254,212
];

// 通常フォルムの種族値を基準にした能力別トップ20出題枠。
const topStatPokemonIds = {
    hp:[
        242,113,799,895,202,975,321,594,143,1003,
        992,289,487,426,977,297,890,40,792,791
    ],
    attack:[
        798,409,486,289,383,386,644,384,612,998,
        896,809,567,901,534,992,464,555,794,1005
    ],
    defense:[
        213,805,377,208,713,306,91,411,95,1025,
        748,680,719,379,703,867,968,563,476,809
    ],
    "special-attack":[
        796,150,806,382,384,386,643,484,720,483,
        897,738,609,864,890,994,792,795,1021,858
    ],
    "special-defense":[
        213,378,250,671,249,379,706,476,719,703,
        748,226,681,382,411,242,987,615,477,1001
    ],
    speed:[
        894,291,795,386,101,617,807,887,889,888,
        847,991,987,1007,1008,1002,169,897,135,142
    ]
};

const comboRewards = {
    3:{
        title:"3問連続正解！",
        message:"ナンジャモが応援している！",
        images:[
            {
                name:"ナンジャモ",
                url:"https://www.pokemon.co.jp/ex/sv/assets/img/character/221014_01/visual.png"
            }
        ]
    },
    5:{
        title:"5問連続正解！",
        message:"カナリィが盛り上げてくれた！",
        images:[
            {
                name:"カナリィ",
                url:"https://www.pokemon.co.jp/ex/legends_z-a/assets/img/characters/251106_01/ill_01.webp"
            }
        ]
    },
    10:{
        title:"10問連続正解！",
        message:"リーリエとユウリが祝福している！",
        images:[
            {
                name:"リーリエ",
                url:"https://www.inside-games.jp/imgs/zoom/1490192.png"
            },
            {
                name:"ユウリ",
                url:"https://img.altema.jp/pokemoncard/card/icon/12577.jpg"
            }
        ]
    }
};

function normalizePokemonName(text){

    return text
        .trim()
        .normalize("NFKC")
        .replace(
            /[\u3041-\u3096]/g,
            ch => String.fromCharCode(
                ch.charCodeAt(0) + 0x60
            )
        );
}

function getTodayText(){

    const parts =
    new Intl.DateTimeFormat(
        "ja-JP",
        {
            timeZone:"Asia/Tokyo",
            year:"numeric",
            month:"2-digit",
            day:"2-digit"
        }
    ).formatToParts(new Date());

    const year =
    parts.find(part => part.type === "year").value;

    const month =
    parts.find(part => part.type === "month").value;

    const day =
    parts.find(part => part.type === "day").value;

    return `${year}-${month}-${day}`;
}

function getPokemonImageUrl(pokemonId){

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
}

async function fetchPokemonSpecies(pokemonId){

    if(speciesCache[pokemonId]){
        return speciesCache[pokemonId];
    }

    const response =
    await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`
    );

    if(!response.ok){
        throw new Error("ポケモン情報を取得できませんでした");
    }

    const species = await response.json();
    speciesCache[pokemonId] = species;

    return species;
}

async function fetchPokemonData(pokemonId){

    if(pokemonDataCache[pokemonId]){
        return pokemonDataCache[pokemonId];
    }

    const response =
    await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemonId}`
    );

    if(!response.ok){
        throw new Error("種族値を取得できませんでした");
    }

    const pokemonData = await response.json();
    pokemonDataCache[pokemonId] = pokemonData;

    return pokemonData;
}

function getJapanesePokemonName(species){

    const japanese =
    species.names.find(
        name => name.language.name === "ja"
    );

    return japanese
    ? japanese.name
    : species.name;
}

function getPokemonIdFromUrl(url){

    const match = url.match(/\/(\d+)\/?$/);

    return match
    ? Number(match[1])
    : 0;
}

async function fetchEvolutionChain(url){

    if(evolutionChainCache[url]){
        return evolutionChainCache[url];
    }

    const response = await fetch(url);

    if(!response.ok){
        throw new Error("進化情報を取得できませんでした");
    }

    const data = await response.json();
    evolutionChainCache[url] = data.chain;

    return data.chain;
}

function findEvolutionRelation(node,targetId,parentId = null){

    const nodeId =
    getPokemonIdFromUrl(node.species.url);

    if(nodeId === targetId){
        return {
            fromId:parentId,
            toIds:node.evolves_to
            .map(child => getPokemonIdFromUrl(child.species.url))
            .filter(id => id >= 1 && id <= 1025)
        };
    }

    for(const child of node.evolves_to){
        const relation =
        findEvolutionRelation(child,targetId,nodeId);

        if(relation){
            return relation;
        }
    }

    return null;
}

async function getEvolutionRelation(pokemonId){

    if(evolutionRelationCache[pokemonId]){
        return evolutionRelationCache[pokemonId];
    }

    const species =
    await fetchPokemonSpecies(pokemonId);

    const chain =
    await fetchEvolutionChain(species.evolution_chain.url);

    const relation =
    findEvolutionRelation(chain,pokemonId) || {
        fromId:null,
        toIds:[]
    };

    evolutionRelationCache[pokemonId] = relation;

    return relation;
}

function getSelectedQuizMode(){

    return document.getElementById(
        "quizModeFilter"
    ).value;
}

async function createQuestionData(pokemonId){

    if(getSelectedQuizMode() === "baseStat"){
        return createBaseStatQuestionData(pokemonId);
    }

    const species =
    await fetchPokemonSpecies(pokemonId);

    const pokemonName =
    getJapanesePokemonName(species);

    const mode =
    getSelectedQuizMode();

    if(mode === "name"){
        return {
            pokemonId,
            pokemonName,
            questionText:"このポケモンはだれ？",
            acceptedAnswers:[pokemonName],
            answerPokemonIds:[pokemonId]
        };
    }

    const relation =
    await getEvolutionRelation(pokemonId);

    const answerIds =
    mode === "evolvesTo"
    ? relation.toIds
    : relation.fromId
        ? [relation.fromId]
        : [];

    if(answerIds.length === 0){
        return null;
    }

    const answerSpecies =
    await Promise.all(
        answerIds.map(id => fetchPokemonSpecies(id))
    );

    return {
        pokemonId,
        pokemonName,
        questionText:
        mode === "evolvesTo"
        ? "このポケモンは進化したら何になる？"
        : "このポケモンの進化元はだれ？",
        acceptedAnswers:
        answerSpecies.map(getJapanesePokemonName),
        answerPokemonIds:answerIds
    };
}

function getJapaneseDescription(species){

    const entry =
    species.flavor_text_entries.find(
        item => item.language.name === "ja"
    );

    return entry
    ? entry.flavor_text.replace(/\s+/g," ")
    : "説明文が見つかりませんでした。";
}

const statLabels = {
    hp:"HP",
    attack:"攻撃",
    defense:"防御",
    "special-attack":"特攻",
    "special-defense":"特防",
    speed:"素早さ"
};

function getPokemonBaseStats(pokemonData){

    return Object.fromEntries(
        pokemonData.stats.map(item => [
            item.stat.name,
            item.base_stat
        ])
    );
}

function getStatQuizPokemonIds(){

    return [
        ...new Set([
            ...championsUsageTop100,
            ...Object.values(topStatPokemonIds).flat()
        ])
    ].filter(id => id >= 1 && id <= 1025);
}

function getStatQuizEligibleStats(pokemonId,pokemonData){

    const stats = getPokemonBaseStats(pokemonData);
    const eligibleStats = [];

    if(championsUsageTop100.includes(pokemonId)){
        const offensePeak =
        Math.max(stats.attack,stats["special-attack"]);
        const defenseAverage =
        (stats.hp + stats.defense + stats["special-defense"]) / 3;

        eligibleStats.push(
            ...(
                offensePeak >= defenseAverage
                ? ["attack","special-attack","speed"]
                : ["hp","defense","special-defense","speed"]
            )
        );
    }

    Object.entries(topStatPokemonIds)
    .forEach(([statName,pokemonIds]) => {
        if(pokemonIds.includes(pokemonId)){
            eligibleStats.push(statName);
        }
    });

    return [...new Set(eligibleStats)];
}

async function createBaseStatQuestionData(pokemonId){

    const [species,pokemonData] =
    await Promise.all([
        fetchPokemonSpecies(pokemonId),
        fetchPokemonData(pokemonId)
    ]);

    const eligibleStats =
    getStatQuizEligibleStats(pokemonId,pokemonData);

    const statName =
    eligibleStats[
        Math.floor(Math.random()*eligibleStats.length)
    ];

    const stats = getPokemonBaseStats(pokemonData);

    return {
        pokemonId,
        pokemonName:getJapanesePokemonName(species),
        questionText:
        `このポケモンの「${statLabels[statName]}」の種族値は？`,
        statName,
        statValue:stats[statName],
        acceptedAnswers:[],
        answerPokemonIds:[pokemonId]
    };
}

function calculateLevel50Stat(statName,baseStat){

    const level = 50;
    const individualValue = 31;
    const effortValue = 0;

    if(statName === "hp"){
        return Math.floor(
            ((baseStat * 2 + individualValue + Math.floor(effortValue / 4)) * level) / 100
        ) + level + 10;
    }

    return Math.floor(
        ((baseStat * 2 + individualValue + Math.floor(effortValue / 4)) * level) / 100
    ) + 5;
}

function createStatsHtml(pokemonData){

    const rows =
    pokemonData.stats.map(item => {

        const statName =
        item.stat.name;

        const baseStat =
        item.base_stat;

        const level50Stat =
        calculateLevel50Stat(
            statName,
            baseStat
        );

        const barWidth =
        Math.min(
            100,
            Math.round(baseStat / 255 * 100)
        );

        return `
        <div class="dex-stat-row">
            <div class="dex-stat-name">${statLabels[statName]}</div>
            <div class="dex-stat-base">${baseStat}</div>
            <div class="dex-stat-bar">
                <div class="dex-stat-fill" style="width:${barWidth}%"></div>
            </div>
            <div class="dex-stat-real">${level50Stat}</div>
        </div>
        `;
    }).join("");

    const total =
    pokemonData.stats.reduce(
        (sum,item) => sum + item.base_stat,
        0
    );

    return `
    <div class="dex-stat-row">
        <div class="dex-stat-name">項目</div>
        <div class="dex-stat-base">種族値</div>
        <div></div>
        <div class="dex-stat-real">Lv50</div>
    </div>
    ${rows}
    <div class="dex-stat-total">
        種族値合計 ${total}
    </div>
    `;
}

function hideAllPages(){

    document.getElementById("mainPage").style.display = "none";
    document.getElementById("dexPage").style.display = "none";
    document.getElementById("dexDetailPage").style.display = "none";
    document.getElementById("achievementPage").style.display = "none";
    document.getElementById("quizResultPage").style.display = "none";
}

function createIdRange(start,end){

    const ids = [];

    for(let i=start;i<=end;i++){
        ids.push(i);
    }

    return ids;
}

function getSelectedGenerationIds(){

    const generation =
    document.getElementById(
        "generationFilter"
    ).value;

    if(generation === "all"){
        return createIdRange(1,1025);
    }

    const range =
    generationRanges[generation];

    return createIdRange(
        range[0],
        range[1]
    );
}

async function getTypePokemonIds(type){

    if(type === "all"){
        return createIdRange(1,1025);
    }

    if(typePokemonCache[type]){
        return typePokemonCache[type];
    }

    const response =
    await fetch(
        `https://pokeapi.co/api/v2/type/${type}`
    );

    const typeData =
    await response.json();

    const ids =
    typeData.pokemon
    .map(item => {
        const match =
        item.pokemon.url.match(
            /\/pokemon\/(\d+)\//
        );

        return match
        ? Number(match[1])
        : null;
    })
    .filter(id => id && id <= 1025);

    typePokemonCache[type] = ids;

    return ids;
}

async function getFilteredPokemonIds(){

    if(getSelectedQuizMode() === "baseStat"){
        return getStatQuizPokemonIds();
    }

    const generationIds =
    getSelectedGenerationIds();

    const type =
    document.getElementById(
        "typeFilter"
    ).value;

    if(type === "all"){
        return generationIds;
    }

    const typeIds =
    await getTypePokemonIds(type);

    const typeIdSet =
    new Set(typeIds);

    return generationIds.filter(
        id => typeIdSet.has(id)
    );
}

function getSelectedQuestionTotal(){

    const selectedCount =
    document.getElementById(
        "questionCountFilter"
    ).value;

    if(selectedCount === "all"){
        return quizPokemonIds.length;
    }

    return Math.min(
        Number(selectedCount),
        quizPokemonIds.length || Number(selectedCount)
    );
}

function updateQuestionProgress(){

    const currentNumber =
    isQuestionActive
    ? answeredQuestions + 1
    : answeredQuestions;

    const selectedCount =
    document.getElementById(
        "questionCountFilter"
    ).value;

    const totalText =
    selectedCount === "all" && quizPokemonIds.length === 0
    ? "すべて"
    : getSelectedQuestionTotal();

    document.getElementById(
        "questionProgress"
    ).textContent =
    `問題 ${currentNumber} / ${totalText}`;
}

async function loadPokemon(){

    const requestId = ++loadRequestId;

    clearInterval(timer);
    isQuestionActive = false;

    document.getElementById("result").textContent="";
    document.getElementById("answer").value="";
    setQuizActionButton("読み込み中...", "loading");

    const filteredPokemonIds =
    await getFilteredPokemonIds();

    if(requestId !== loadRequestId){
        return;
    }

    if(quizPokemonIds.length === 0){
        quizPokemonIds = filteredPokemonIds;
    }

    const questionTotal =
    getSelectedQuestionTotal();

    if(filteredPokemonIds.length === 0 || questionTotal === 0){

        currentPokemon = "";
        currentPokemonId = 0;

        document.getElementById(
            "pokemonImage"
        ).removeAttribute("src");

        document.getElementById(
            "timer"
        ).textContent =
        "⏰ 出題できるポケモンがいません";

        document.getElementById(
            "result"
        ).textContent =
        "世代とタイプの組み合わせを変更してください";

        setQuizActionButton("スタート", "start");

        return;
    }

    let availablePokemonIds =
    quizPokemonIds.filter(
        id => !usedPokemonIds.includes(id)
    );

    let questionData = null;

    try{
        while(
            availablePokemonIds.length > 0 &&
            !questionData
        ){
            const randomIndex =
            Math.floor(
                Math.random()*availablePokemonIds.length
            );

            const pokemonId =
            availablePokemonIds[randomIndex];

            usedPokemonIds.push(pokemonId);
            availablePokemonIds.splice(randomIndex,1);

            questionData =
            await createQuestionData(pokemonId);

            if(requestId !== loadRequestId){
                return;
            }
        }
    }catch(error){
        if(requestId !== loadRequestId){
            return;
        }

        document.getElementById("timer").textContent =
        "⏰ 読み込みに失敗しました";

        document.getElementById("result").textContent =
        "通信状態を確認して、もう一度お試しください";

        setQuizActionButton("もう一度試す", "next");
        return;
    }

    if(!questionData){
        if(answeredQuestions === 0){
            quizPokemonIds = [];
            usedPokemonIds = [];

            document.getElementById("timer").textContent =
            "⏰ 出題できる進化問題がありません";

            document.getElementById("result").textContent =
            "世代・タイプ・クイズモードを変更してください";

            setQuizActionButton("スタート", "start");
            return;
        }

        showQuizResult();
        return;
    }

    currentPokemonId = questionData.pokemonId;
    currentPokemon =
    questionData.acceptedAnswers[0]
    || questionData.pokemonName;
    currentAcceptedAnswers = questionData.acceptedAnswers;
    currentAnswerPokemonIds = questionData.answerPokemonIds;
    currentStatName = questionData.statName || "";
    currentStatValue = questionData.statValue || 0;

    document.getElementById(
        "questionText"
    ).textContent =
    questionData.questionText;

    document.getElementById(
        "questionPokemonName"
    ).textContent =
    getSelectedQuizMode() === "name"
    ? ""
    : questionData.pokemonName;

    const answerInput =
    document.getElementById("answer");

    if(getSelectedQuizMode() === "baseStat"){
        answerInput.placeholder = "種族値を数字で入力";
        answerInput.inputMode = "numeric";
    }else{
        answerInput.placeholder = "ポケモン名を入力";
        answerInput.removeAttribute("inputmode");
    }

    const image =
    getPokemonImageUrl(questionData.pokemonId);

    const img =
    document.getElementById("pokemonImage");

    img.src = image;

    if(
      document.getElementById("silhouetteMode").checked
    ){
        img.classList.add("silhouette");
    }else{
        img.classList.remove("silhouette");
    }

    isQuestionActive = true;

    updateProgress();
    updateQuestionProgress();
    setQuizActionButton("回答", "answer");

    startTimer();
}

function handleQuizAction(){

    if(quizAction === "loading"){
        return;
    }

    if(quizAction === "answer"){
        checkAnswer();
        return;
    }

    if(quizFinished || quizAction === "restart"){
        resetQuestion("⏰ スタートを押してください");
    }

    loadPokemon();
}

function setQuizActionButton(text,action){

    const quizActionButton =
    document.getElementById("quizActionButton");

    quizAction = action;
    quizActionButton.textContent = text;
    quizActionButton.disabled = action === "loading";
}

function resetQuestion(message){

    loadRequestId++;
    clearInterval(timer);
    clearTimeout(comboToastTimer);
    isQuestionActive = false;
    answeredQuestions = 0;
    correctAnswers = 0;
    currentCombo = 0;
    quizFinished = false;
    quizPokemonIds = [];
    usedPokemonIds = [];
    currentPokemon = "";
    currentPokemonId = 0;
    currentAcceptedAnswers = [];
    currentAnswerPokemonIds = [];
    currentStatName = "";
    currentStatValue = 0;
    statQuizPoints = 0;

    document.getElementById("comboToast").style.display = "none";
    document.getElementById("answer").value = "";
    document.getElementById("result").textContent = "";
    document.getElementById("timer").textContent = message;
    document.getElementById("pokemonImage").removeAttribute("src");
    document.getElementById("questionText").textContent =
    getSelectedQuizMode() === "baseStat"
    ? "ポケモンの種族値を当てよう！"
    : getSelectedQuizMode() === "evolvesTo"
    ? "このポケモンは進化したら何になる？"
    : getSelectedQuizMode() === "evolvesFrom"
        ? "このポケモンの進化元はだれ？"
        : "このポケモンはだれ？";
    document.getElementById("questionPokemonName").textContent = "";
    updateQuizModeUI();

    updateQuestionProgress();
    setQuizActionButton("スタート", "start");
}

function finishQuestion(){

    answeredQuestions++;
    updateQuestionProgress();

    if(answeredQuestions >= getSelectedQuestionTotal()){

        quizFinished = true;
        showQuizResult();

        return;
    }

    setQuizActionButton("次の問題へ", "next");
}

function getResultInfo(accuracy){

    if(accuracy === 100){
        return {
            className:"result-perfect",
            face:"🎉",
            title:"すばらしい",
            message:"すばらしい！",
            pokemonIds:[493]
        };
    }

    if(accuracy >= 90){
        return {
            className:"result-excellent",
            face:"🌟",
            title:"たいへんよくできています",
            message:"たいへんよくできています",
            pokemonIds:[482,481,480]
        };
    }

    if(accuracy >= 80){
        return {
            className:"result-great",
            face:"😊",
            title:"よくできています",
            message:"よくできています",
            pokemonIds:[151,150]
        };
    }

    if(accuracy >= 70){
        return {
            className:"result-good",
            face:"🙂",
            title:"まあまあです",
            message:"まあまあです",
            pokemonIds:[197,196]
        };
    }

    if(accuracy >= 60){
        return {
            className:"result-nice",
            face:"😄",
            title:"いいかんじです！",
            message:"いいかんじです！",
            pokemonIds:[25]
        };
    }

    if(accuracy >= 50){
        return {
            className:"result-normal",
            face:"😐",
            title:"ふつうですね",
            message:"ふつうですね",
            pokemonIds:[428,54,59]
        };
    }

    return {
        className:"result-sad",
        face:"😢",
        title:"残念でした",
        message:"残念でした。もう一度頑張りましょう！",
        pokemonIds:[316]
    };
}

function createPokemonImageHtml(pokemonIds){

    return pokemonIds
    .map(id => `
        <img
        src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png"
        alt="結果ポケモン">
    `)
    .join("");
}

function showComboReward(comboCount){

    const reward =
    comboRewards[comboCount];

    if(!reward){
        return;
    }

    clearTimeout(comboToastTimer);

    document.getElementById(
        "comboTitle"
    ).textContent =
    reward.title;

    document.getElementById(
        "comboMessage"
    ).textContent =
    reward.message;

    document.getElementById(
        "comboImages"
    ).innerHTML =
    reward.images.map(item => `
        <img
        src="${item.url}"
        alt="${item.name}"
        onerror="this.style.display='none'">
    `).join("");

    const comboToast =
    document.getElementById("comboToast");

    comboToast.style.display = "flex";

    comboToastTimer =
    setTimeout(() => {
        comboToast.style.display = "none";
    },1800);
}

function showQuizResult(){

    clearInterval(timer);
    isQuestionActive = false;
    quizFinished = true;

    const isBaseStatQuiz =
    getSelectedQuizMode() === "baseStat";

    const maximumStatPoints =
    answeredQuestions * 20;

    const accuracy =
    answeredQuestions === 0
    ? 0
    : isBaseStatQuiz
        ? Math.round(
            statQuizPoints / maximumStatPoints * 100
        )
        : Math.round(
            correctAnswers / answeredQuestions * 100
        );

    const resultInfo =
    getResultInfo(accuracy);

    const resultPage =
    document.getElementById("quizResultPage");

    resultPage.className =
    `container page result-page ${resultInfo.className}`;

    document.getElementById("resultFace")
    .textContent = resultInfo.face;

    document.getElementById("resultTitle")
    .textContent = resultInfo.title;

    document.getElementById("resultPokemonImages")
    .innerHTML =
    createPokemonImageHtml(resultInfo.pokemonIds);

    document.getElementById("resultScore")
    .textContent =
    isBaseStatQuiz
    ? `${accuracy}点 / 100点`
    : `正答率 ${accuracy}%（${correctAnswers} / ${answeredQuestions}）`;

    document.getElementById("resultMessage")
    .textContent =
    isBaseStatQuiz
    ? `合計 ${statQuizPoints} / ${maximumStatPoints}点を100点満点に換算しました。`
    : resultInfo.message;

    hideAllPages();

    resultPage.style.display = "flex";
    location.hash = "result";
}

function backToQuizFromResult(){

    hideAllPages();

    document.getElementById("mainPage").style.display = "block";

    if(location.hash === "#result"){
        history.pushState(
            "",
            document.title,
            location.pathname
        );
    }

    resetQuestion("⏰ スタートを押してください");
}

function calculateBaseStatQuestionPoints(answerValue,correctValue){

    const difference =
    Math.abs(answerValue-correctValue);

    return Math.max(
        0,
        20-Math.floor(difference/5)
    );
}

function checkBaseStatAnswer(answer){

    if(
        answer === "" ||
        !/^\d+$/.test(answer)
    ){
        document.getElementById("result").textContent =
        "0以上の整数で入力してください";
        return;
    }

    clearInterval(timer);
    isQuestionActive = false;

    const answerValue = Number(answer);
    const difference =
    Math.abs(answerValue-currentStatValue);
    const questionPoints =
    calculateBaseStatQuestionPoints(
        answerValue,
        currentStatValue
    );

    statQuizPoints += questionPoints;

    document.getElementById("result").textContent =
    `正解は ${currentStatValue}（誤差 ${difference}）／ ${questionPoints}点`;

    finishQuestion();
}

function checkAnswer(){

    if(!isQuestionActive){
        document.getElementById("result")
        .textContent="スタートを押してから回答してください";
        return;
    }

    const answer =
    document
    .getElementById("answer")
    .value
    .trim();

    if(getSelectedQuizMode() === "baseStat"){
        checkBaseStatAnswer(answer);
        return;
    }

    const normalizedAnswer =
    normalizePokemonName(answer);

    const matchedAnswerIndex =
    currentAcceptedAnswers.findIndex(
        pokemonName =>
        normalizePokemonName(pokemonName)
        === normalizedAnswer
    );

    if(matchedAnswerIndex !== -1){
        
        clearInterval(timer);
        isQuestionActive = false;

        document.getElementById("result")
        .textContent="⭕ 正解！";

        const foundPokemonId =
        currentAnswerPokemonIds[matchedAnswerIndex]
        || currentPokemonId;

        if(!foundPokemon.includes(foundPokemonId)){
            foundPokemon.push(
            foundPokemonId
            );

            foundPokemonMeta[foundPokemonId] = {
                firstFoundAt:getTodayText()
            };

            localStorage.setItem(
            "foundPokemon",
            JSON.stringify(foundPokemon)
            );

            localStorage.setItem(
            "foundPokemonMeta",
            JSON.stringify(foundPokemonMeta)
            );
        }

        updateProgress();
        correctAnswers++;
        currentCombo++;
        showComboReward(currentCombo);

        finishQuestion();

    }else{

        clearInterval(timer);
        isQuestionActive = false;
        currentCombo = 0;

        document.getElementById("result")
        .textContent =
        `❌ 不正解！ 正解は ${currentAcceptedAnswers.join(" / ")}`;

        finishQuestion();
    }
}

function updateProgress(){

    document.getElementById(
    "progress"
    ).textContent =
    `図鑑完成率 ${foundPokemon.length} / 1025`;

    let achievements = 0;

    if(foundPokemon.length >= 1)
    achievements++;

    if(foundPokemon.length >= 10)
    achievements++;

    document.getElementById(
    "achievement"
    ).textContent =
    `🏆 実績 ${achievements}個`;
}

function startTimer(){

    clearInterval(timer);

    timeLeft = 20;

    document.getElementById(
        "timer"
    ).textContent =
    `⏰ 残り時間: ${timeLeft}秒`;

    timer = setInterval(() => {

        timeLeft--;

        document.getElementById(
            "timer"
        ).textContent =
        `⏰ 残り時間: ${timeLeft}秒`;

        if(timeLeft <= 0){

            clearInterval(timer);
            isQuestionActive = false;
            currentCombo = 0;

            document.getElementById(
                "result"
            ).textContent =
            getSelectedQuizMode() === "baseStat"
            ? `⏰ 時間切れ！ 正解は ${currentStatValue}（0点）`
            : `⏰ 時間切れ！ 正解は ${currentAcceptedAnswers.join(" / ")}`;

            finishQuestion();
        }

    },1000);
}

document
.getElementById(
"silhouetteMode"
)
.addEventListener(
"change",
() => {
    const img =
    document.getElementById("pokemonImage");

    if(document.getElementById("silhouetteMode").checked){
        img.classList.add("silhouette");
    }else{
        img.classList.remove("silhouette");
    }
}
);

function updateQuizModeUI(){

    const isBaseStatQuiz =
    getSelectedQuizMode() === "baseStat";

    document.getElementById(
        "generationFilter"
    ).disabled = isBaseStatQuiz;

    document.getElementById(
        "typeFilter"
    ).disabled = isBaseStatQuiz;

    const questionCountFilter =
    document.getElementById("questionCountFilter");

    if(isBaseStatQuiz){
        questionCountFilter.value = "10";
    }

    questionCountFilter.disabled = isBaseStatQuiz;

    const silhouetteMode =
    document.getElementById("silhouetteMode");

    silhouetteMode.disabled = isBaseStatQuiz;

    if(isBaseStatQuiz){
        silhouetteMode.checked = false;
        document.getElementById(
            "pokemonImage"
        ).classList.remove("silhouette");
    }

    document.getElementById(
        "statQuizNote"
    ).style.display =
    isBaseStatQuiz
    ? "block"
    : "none";

    const answerInput =
    document.getElementById("answer");

    answerInput.placeholder =
    isBaseStatQuiz
    ? "種族値を数字で入力"
    : "ポケモン名を入力";
}

document
.getElementById(
"quizModeFilter"
)
.addEventListener(
"change",
() => {
    updateQuizModeUI();
    resetQuestion("⏰ スタートを押してください");
}
);

document
.getElementById(
"generationFilter"
)
.addEventListener(
"change",
() => resetQuestion("⏰ スタートを押してください")
);

document
.getElementById(
"typeFilter"
)
.addEventListener(
"change",
() => resetQuestion("⏰ スタートを押してください")
);

document
.getElementById(
"questionCountFilter"
)
.addEventListener(
"change",
() => resetQuestion("⏰ スタートを押してください")
);

document
.getElementById(
"answer"
)
.addEventListener(
"keydown",
event => {
    if(event.key === "Enter"){
        handleQuizAction();
    }
}
);

resetQuestion("⏰ スタートを押してください");
async function showDex(){

    hideAllPages();

    document.getElementById(
        "dexPage"
    ).style.display = "block";

    location.hash = "dex";

    const dexList =
    document.getElementById(
        "dexList"
    );

    dexList.innerHTML =
    "図鑑を読み込み中...";

    let html = "";

    for(let i=1;i<=1025;i++){

        if(foundPokemon.includes(i)){

            const species =
            await fetchPokemonSpecies(i);

            const name =
            getJapanesePokemonName(species);

            html += `
            <button class="dex-item" onclick="showDexDetail(${i})">
            No.${String(i).padStart(4,"0")}
            ${name}
            ✅
            </button>
            `;

        }else{

            html += `
            <button class="dex-item locked" onclick="showDexDetail(${i})">
            No.${String(i).padStart(4,"0")}
            ????????
            ❓
            </button>
            `;
        }
    }

    dexList.innerHTML = html;
}

function hideDex(){

    hideAllPages();

    document.getElementById(
        "mainPage"
    ).style.display = "block";

    if(location.hash === "#dex"){
        history.pushState(
            "",
            document.title,
            location.pathname
        );
    }
}

async function showDexDetail(pokemonId){

    currentDexDetailId = pokemonId;

    hideAllPages();

    document.getElementById(
        "dexDetailPage"
    ).style.display = "block";

    location.hash = `dex-${pokemonId}`;

    const isFound =
    foundPokemon.includes(pokemonId);

    const detailImage =
    document.getElementById(
        "dexDetailImage"
    );

    detailImage.src =
    getPokemonImageUrl(pokemonId);

    if(isFound){
        detailImage.classList.remove("silhouette");
    }else{
        detailImage.classList.add("silhouette");
    }

    document.getElementById(
        "dexDetailNumber"
    ).textContent =
    `No.${String(pokemonId).padStart(4,"0")}`;

    updateDexNavButtons();

    const foundDate =
    foundPokemonMeta[pokemonId]
    ? foundPokemonMeta[pokemonId].firstFoundAt
    : "記録なし";

    document.getElementById(
        "dexDetailFoundDate"
    ).textContent =
    `初めて答えた日: ${isFound ? foundDate : "未発見"}`;

    if(!isFound){

        document.getElementById(
            "dexDetailTitle"
        ).textContent =
        "????????";

        document.getElementById(
            "dexDetailDescription"
        ).textContent =
        "まだクイズで正解していないポケモンです。";

        document.getElementById(
            "dexDetailStats"
        ).innerHTML =
        `<div class="dex-stat-total">未発見のため非表示</div>`;

        return;
    }

    document.getElementById(
        "dexDetailTitle"
    ).textContent =
    "読み込み中...";

    const species =
    await fetchPokemonSpecies(pokemonId);

    document.getElementById(
        "dexDetailTitle"
    ).textContent =
    getJapanesePokemonName(species);

    document.getElementById(
        "dexDetailDescription"
    ).textContent =
    getJapaneseDescription(species);

    document.getElementById(
        "dexDetailStats"
    ).innerHTML =
    "種族値を読み込み中...";

    const pokemonData =
    await fetchPokemonData(pokemonId);

    document.getElementById(
        "dexDetailStats"
    ).innerHTML =
    createStatsHtml(pokemonData);
}

function backToDexList(){

    hideAllPages();

    document.getElementById(
        "dexPage"
    ).style.display = "block";

    location.hash = "dex";
}

function updateDexNavButtons(){

    document.getElementById(
        "dexPrevButton"
    ).disabled = currentDexDetailId <= 1;

    document.getElementById(
        "dexNextButton"
    ).disabled = currentDexDetailId >= 1025;
}

function moveDexDetail(direction){

    const nextId =
    currentDexDetailId + direction;

    if(nextId < 1 || nextId > 1025){
        return;
    }

    showDexDetail(nextId);
}

function showAchievements(){

    hideAllPages();

    document.getElementById(
        "achievementPage"
    ).style.display = "block";

    location.hash = "achievements";

    let html = "";

    const achievements = [

        {
            title:"🏆 はじめての発見",
            unlocked:foundPokemon.length >= 1
        },

        {
            title:"🏆 ポケモントレーナー",
            unlocked:foundPokemon.length >= 10
        },

        {
            title:"🏆 ポケモン博士見習い",
            unlocked:foundPokemon.length >= 50
        },

        {
            title:"🏆 ポケモン博士",
            unlocked:foundPokemon.length >= 100
        },

        {
            title:"🏆 図鑑マスター",
            unlocked:foundPokemon.length >= 500
        },

        {
            title:"🏆 全国図鑑完成",
            unlocked:foundPokemon.length >= 1025
        }

    ];

    achievements.forEach(a => {

        html += `
        <div class="achievement-item">
            ${
                a.unlocked
                ? a.title + " ✅"
                : "🔒 " + a.title
            }
        </div>
        `;
    });

    document.getElementById(
        "achievementList"
    ).innerHTML = html;
}

function hideAchievements(){

    hideAllPages();

    document.getElementById(
        "mainPage"
    ).style.display = "block";

    if(location.hash === "#achievements"){
        history.pushState(
            "",
            document.title,
            location.pathname
        );
    }
}
