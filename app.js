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
let currentQuestionDescription = "";
let currentAnswerDescriptions = [];
let currentCardQuestion = null;
let selectedCardChoiceIndex = null;

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

const cardEffectQuestions = [
    {
        name:"マナフィ",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SVK/046074_P_MANAFUI.jpg",
        effect:"自分のベンチポケモン全員が、相手のワザのダメージを受けなくなる。",
        note:"特性「なみのヴェール」でベンチ狙撃を守るカード。"
    },
    {
        name:"イキリンコex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047869_P_IKIRINKOEX.jpg",
        effect:"最初の自分の番に、自分の手札をすべてトラッシュして山札を6枚引く。",
        note:"序盤の手札入れ替えに使いやすい特性「イキリテイク」。"
    },
    {
        name:"ミュウex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047861_P_MIXYUUEX.jpg",
        effect:"最初の自分の番に、自分の手札が3枚になるように山札を引く。",
        note:"手札を使い切ってから補充しやすい特性「リスタート」。"
    },
    {
        name:"ネオラントV",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SVK/046073_P_NEORANTOV.jpg",
        effect:"手札からベンチに出したとき、山札からサポートを1枚選んで手札に加える。",
        note:"特性「ルミナスサイン」で状況に合うサポートを探せる。"
    },
    {
        name:"かがやくゲッコウガ",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SVK/046075_P_KAGAYAKUGEKKOUGA.jpg",
        effect:"手札からエネルギーを1枚トラッシュすると、山札を2枚引ける。",
        note:"特性「かくしふだ」でエネルギーを使って山札を引く。"
    },
    {
        name:"ロトムV",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SP6/041955_P_ROTOMUV.jpg",
        effect:"自分の番を終わらせるかわりに、山札を3枚引く。",
        note:"特性「そくせきじゅうでん」で序盤の手札を増やせる。"
    },
    {
        name:"キチキギスex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049205_P_KICHIKIGISUEX.jpg",
        effect:"前の相手の番に自分のポケモンがきぜつしていたなら、山札を3枚引く。",
        note:"特性「さかてにとる」で返しの番に手札を補充できる。"
    },
    {
        name:"なかよしポフィン",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049364_T_NAKAYOSHIPOFUIN.jpg",
        effect:"山札からHP70以下のたねポケモンを2枚まで選び、ベンチに出す。",
        note:"序盤に小型のたねポケモンを並べるためのグッズ。"
    },
    {
        name:"ネストボール",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047878_T_NESUTOBORU.jpg",
        effect:"山札からたねポケモンを1枚選び、ベンチに出す。",
        note:"HP制限なしでたねポケモンを場に出せる。"
    },
    {
        name:"ハイパーボール",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049367_T_HAIPABORU.jpg",
        effect:"手札を2枚トラッシュして、山札からポケモンを1枚手札に加える。",
        note:"進化ポケモンも含めて好きなポケモンを探せる。"
    },
    {
        name:"すごいつりざお",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047874_T_SUGOITSURIZAO.jpg",
        effect:"トラッシュのポケモンと基本エネルギーを合計3枚まで山札に戻す。",
        note:"倒されたポケモンやエネルギーを山札へ戻せる。"
    },
    {
        name:"ふしぎなアメ",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049371_T_FUSHIGINAAME.jpg",
        effect:"手札の2進化ポケモンを、場のたねポケモンに直接のせて進化させる。",
        note:"1進化を飛ばして2進化につなげるグッズ。"
    },
    {
        name:"夜のタンカ",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049386_T_YORUNOTANKA.jpg",
        effect:"トラッシュからポケモンまたは基本エネルギーを1枚選び、手札に加える。",
        note:"必要なポケモンやエネルギーをすぐ手札に戻せる。"
    },
    {
        name:"森の封印石",
        kind:"ポケモンのどうぐ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SVK/046097_T_MORINOFUUINSEKI.jpg",
        effect:"つけているポケモンVが、山札から好きなカードを1枚手札に加えるVSTARパワーを使える。",
        note:"特性「スターアルケミー」を使えるようにするどうぐ。"
    },
    {
        name:"ペパー",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047897_T_PEPA.jpg",
        effect:"山札からグッズとポケモンのどうぐを1枚ずつ選び、手札に加える。",
        note:"必要なグッズとどうぐを同時に探せるサポート。"
    },
    {
        name:"博士の研究",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047896_T_HAKASENOKENKIXYUU.jpg",
        effect:"自分の手札をすべてトラッシュし、山札を7枚引く。",
        note:"手札を大きく入れ替える代表的なドローサポート。"
    },
    {
        name:"ボスの指令",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049440_T_BOSUNOSHIREI.jpg",
        effect:"相手のベンチポケモンを1匹選び、バトルポケモンと入れ替える。",
        note:"狙いたい相手のポケモンをバトル場に呼べる。"
    },
    {
        name:"カウンターキャッチャー",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047873_T_KAUNTAKIXYATCHIXYA.jpg",
        effect:"自分のサイドの残りが相手より多いとき、相手のベンチポケモンをバトル場に呼び出す。",
        note:"劣勢時にサポート権を使わず相手を呼べるグッズ。"
    },
    {
        name:"メガマフォクシーex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M-P/050174_P_MMAFUOKUSHIEX.jpg",
        effect:"山札の上から9枚を見て、その中のポケモンを好きなだけベンチに出せる。",
        note:"ワザ「トリックポータル」で一気に場を展開できる。"
    },
    {
        name:"カジリガメ",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV7/045965_P_KAJIRIGAME.jpg",
        effect:"特性で受けるダメージを抑えながら戦える、耐久寄りの1進化ポケモン。",
        note:"特性「てっぺきシェル」が特徴のカード。"
    },
    {
        name:"ハピナスex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049278_P_HAPINASUEX.jpg",
        effect:"自分のポケモンについている基本エネルギーを動かして、耐久と攻撃を支えられる。",
        note:"エネルギーを動かす役としてデッキを支えるポケモン。"
    },
    {
        name:"メガガルーラex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1S/047847_P_MGARURAEX.jpg",
        effect:"バトル場にいるなら、自分の番に1回、山札を2枚引ける。",
        note:"特性「おつかいダッシュ」で手札を増やせる。"
    },
    {
        name:"メガライボルトex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1S/047828_P_MRAIBORUTOEX.jpg",
        effect:"ワザを使った次の相手の番、たねポケモンからワザのダメージを受けなくなる。",
        note:"ワザ「フラッシュレイ」でたねポケモン相手に強く出られる。"
    },
    {
        name:"メガアブソルex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1L/047771_P_MABUSORUEX.jpg",
        effect:"相手のバトルポケモンにダメカンが6個のっていれば、そのポケモンをきぜつさせる。",
        note:"ワザ「デスピリオド」で条件付きのきぜつを狙える。"
    },
    {
        name:"ドラパルトex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049264_P_DORAPARUTOEX.jpg",
        effect:"200ダメージを与え、ダメカン6個を相手のベンチポケモンに好きなようにのせる。",
        note:"ワザ「ファントムダイブ」でバトル場とベンチを同時に攻める。"
    },
    {
        name:"バシャーモex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SVM/046470_P_BASHIXYAMOEX.jpg",
        effect:"自分の番に1回、トラッシュから基本エネルギーを1枚選び、自分のポケモンにつける。",
        note:"特性「たぎるとうし」でエネルギーを加速できる。"
    },
    {
        name:"メガフシギバナex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1L/047736_P_MFUSHIGIBANAEX.jpg",
        effect:"自分の場の基本草エネルギーを、自分の別のポケモンにつけ替えられる。",
        note:"特性「ソーラートランス」で草エネルギーを動かせる。"
    },
    {
        name:"メガミミロップex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2/048412_P_MMIMIROPPUEX.jpg",
        effect:"この番にベンチからバトル場に出ていたなら、ワザのダメージが大きく上がる。",
        note:"ワザ「しっぷうづき」は入れ替えと相性がいい。"
    },
    {
        name:"Nのゾロアークex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049186_P_NNOZOROAKUEX.jpg",
        effect:"手札を1枚トラッシュするなら、自分の山札を2枚引ける。",
        note:"特性「とりひき」で手札を整えられる。"
    },
    {
        name:"ユキメノコ",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV8a/046699_P_YUKIMENOKO.jpg",
        effect:"ポケモンチェックのたび、特性を持つポケモンにダメカンをのせる。",
        note:"特性「いてつくとばり」で特性持ちに圧力をかける。"
    },
    {
        name:"マシマシラ",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049074_P_MASHIMASHIRA.jpg",
        effect:"悪エネルギーがついていれば、自分の場のダメカンを相手の場にのせ替えられる。",
        note:"特性「アドレナブレイン」でダメカンを動かせる。"
    },
    {
        name:"フーディン",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1S/047834_P_FUDEIN.jpg",
        effect:"自分の番に1回、手札を1枚トラッシュして山札を2枚引ける。",
        note:"特性「サイコドロー」で手札を整える2進化ポケモン。"
    },
    {
        name:"メガルカリオex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2a/048614_P_MRUKARIOEX.jpg",
        effect:"ワザでトラッシュの基本闘エネルギーを3枚まで、ベンチポケモンに好きなようにつける。",
        note:"ワザ「はどうづき」で闘エネルギーを再利用できる。"
    },
    {
        name:"オリーヴァex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/048787_P_ORIVUAEX.jpg",
        effect:"相手のポケモンを6回選び、選んだ回数ぶんダメージをばらまく。",
        note:"ワザ「オイルマシンガン」で相手の場にダメージを分配する。"
    },
    {
        name:"カミツオロチex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/048780_P_KAMITSUOROCHIEX.jpg",
        effect:"手札の基本草エネルギーを自分のポケモンにつけ、そのポケモンのHPを30回復する。",
        note:"特性「じゅくせいチャージ」で加速と回復を同時に行う。"
    },
    {
        name:"イワパレス",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/048762_P_IWAPARESU.jpg",
        effect:"条件を満たすと、相手のポケモンexからワザのダメージを受けにくくなる。",
        note:"特性でポケモンex相手の耐久を支えるカード。"
    },
    {
        name:"マリィのオーロンゲex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2a/050003_P_MARIINOORONGEEX.jpg",
        effect:"手札から進化したとき、山札から基本悪エネルギーを5枚までマリィのポケモンにつけられる。",
        note:"特性「パンクアップ」でマリィのポケモンを一気に育てる。"
    },
    {
        name:"メガゲッコウガex",
        kind:"ポケモン",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M4/050106_P_MGEKKOUGAEX.jpg",
        effect:"バトル場で基本水エネルギーをトラッシュすると、相手のポケモン1匹にダメカンを6個のせる。",
        note:"特性「ひっさつしゅりけん」で相手の場を狙える。"
    },
    {
        name:"リーリエの決心",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047900_T_RIRIENOKESSHIN.jpg",
        effect:"手札をすべて山札にもどして切り、山札を6枚引く。サイドが6枚なら8枚引く。",
        note:"6/24ジムバトル優勝デッキで多く採用されていたドローサポート。"
    },
    {
        name:"ポケパッド",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M3/049703_T_POKEPADDO.jpg",
        effect:"山札からルールを持たないポケモンを1枚選び、手札に加える。",
        note:"ルールを持たないポケモンを探せるグッズ。"
    },
    {
        name:"スペシャルレッドカード",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M4/050156_T_SUPESHIXYARUREDDOKADO.jpg",
        effect:"相手のサイドが3枚以下なら使える。相手は手札を山札の下にもどし、3枚引く。",
        note:"終盤に相手の手札を減らせる妨害グッズ。"
    },
    {
        name:"ヒカリ",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2/048417_T_HIKARI.jpg",
        effect:"山札からたね・1進化・2進化ポケモンを1枚ずつ選び、手札に加える。",
        note:"進化ラインをまとめてそろえやすいサポート。"
    },
    {
        name:"ふうせん",
        kind:"ポケモンのどうぐ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047889_T_FUUSEN.jpg",
        effect:"つけているポケモンのにげるためのエネルギーが2個ぶん少なくなる。",
        note:"バトル場から動きやすくするポケモンのどうぐ。"
    },
    {
        name:"ジャッジマン",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M-P/049608_T_JIXYAJJIMAN.jpg",
        effect:"おたがいの手札をすべて山札にもどして切り、それぞれ山札を4枚引く。",
        note:"相手の手札を流しながら自分も引き直すサポート。"
    },
    {
        name:"ポケモンいれかえ",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MA/047882_T_POKEMONIREKAE.jpg",
        effect:"自分のバトルポケモンをベンチポケモンと入れ替える。",
        note:"にげるエネルギーを使わずに入れ替えられる基本グッズ。"
    },
    {
        name:"アカマツ",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV7/046036_T_AKAMATSU.jpg",
        effect:"山札から違うタイプの基本エネルギーを2枚まで選び、1枚を手札、残りをポケモンにつける。",
        note:"エネルギー確保と加速を同時にできるサポート。"
    },
    {
        name:"スイレンのお世話",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049428_T_SUIRENNOOSEWA.jpg",
        effect:"トラッシュからルールを持たないポケモンと基本エネルギーを合計3枚まで手札に加える。",
        note:"ポケモンと基本エネルギーをまとめて回収できる。"
    },
    {
        name:"トウコ",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV11W/047707_T_TOUKO.jpg",
        effect:"山札から進化ポケモンとエネルギーを1枚ずつ選び、手札に加える。",
        note:"進化先とエネルギーを同時に探せるサポート。"
    },
    {
        name:"ロケット団の監視塔",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2a/048711_T_ROKETTODANNOKANSHITOU.jpg",
        effect:"おたがいの場のポケモン全員の特性が、すべてなくなる。",
        note:"特性に頼るデッキへ強く刺さるスタジアム。"
    },
    {
        name:"アンフェアスタンプ(ACE SPEC)",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV5a/045640_T_ANFUEASUTANPU.jpg",
        effect:"前の相手の番に自分のポケモンがきぜつしていたなら使える。自分は5枚、相手は2枚引き直す。",
        note:"きぜつ後に手札差を作れるACE SPEC。"
    },
    {
        name:"ヒーローマント(ACE SPEC)",
        kind:"ポケモンのどうぐ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MBD/048300_T_HIROMANTO.jpg",
        effect:"つけているポケモンの最大HPを100大きくする。",
        note:"耐久力を大きく上げるACE SPECのどうぐ。"
    },
    {
        name:"ポケギア3.0",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SLD/041334_T_POKEGIA30.jpg",
        effect:"山札を上から7枚見て、その中からサポートを1枚手札に加える。",
        note:"必要なサポートに触りやすくするグッズ。"
    },
    {
        name:"ロケット団のラムダ",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2a/048701_T_ROKETTODANNORAMUDA.jpg",
        effect:"山札からトレーナーズを1枚選び、手札に加える。",
        note:"トレーナーズなら種類を問わず探せるロケット団のサポート。"
    },
    {
        name:"ゼロの大空洞",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV7/046041_T_ZERONODAIKUUDOU.jpg",
        effect:"場にテラスタルのポケモンがいるプレイヤーは、ベンチを8匹まで出せる。",
        note:"テラスタルデッキのベンチ枠を広げるスタジアム。"
    },
    {
        name:"パワープロテイン",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1L/047791_T_PAWAPUROTEIN.jpg",
        effect:"この番、自分の闘ポケモンのワザが相手のバトルポケモンに与えるダメージを30大きくする。",
        note:"闘ポケモンの打点を伸ばすグッズ。"
    },
    {
        name:"ファイトゴング",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1L/047792_T_FUAITOGONGU.jpg",
        effect:"山札から闘タイプのたねポケモンまたは基本闘エネルギーを1枚手札に加える。",
        note:"闘デッキの初動を支えるグッズ。"
    },
    {
        name:"ミツルの思いやり",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1S/047856_T_MITSURUNOOMOIYARI.jpg",
        effect:"自分のメガシンカex1匹のHPをすべて回復し、そのポケモンのエネルギーをすべて手札にもどす。",
        note:"メガシンカexを大きく回復できるサポート。"
    },
    {
        name:"むしとりセット",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049383_T_MUSHITORISETTO.jpg",
        effect:"山札の上から7枚を見て、草ポケモンと基本草エネルギーを合計2枚まで手札に加える。",
        note:"草デッキのポケモンとエネルギーを探せる。"
    },
    {
        name:"エネルギーつけかえ",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049354_T_ENERUGITSUKEKAE.jpg",
        effect:"自分の場のポケモンについている基本エネルギーを1個、別のポケモンにつけ替える。",
        note:"場のエネルギーを動かして攻撃準備を整える。"
    },
    {
        name:"グラビティーマウンテン",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2a/048705_T_GURABITEIMAUNTEN.jpg",
        effect:"おたがいの場の2進化ポケモン全員の最大HPを30小さくする。",
        note:"2進化ポケモンの耐久を下げるスタジアム。"
    },
    {
        name:"ジャンボアイス",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2/048413_T_JIXYANBOAISU.jpg",
        effect:"エネルギーが3個以上ついている自分のバトルポケモンのHPを80回復する。",
        note:"エネルギーが多いポケモンを回復するグッズ。"
    },
    {
        name:"ムク",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M5/050297_T_MUKU.jpg",
        effect:"手札からルールを持たないポケモンを2枚までトラッシュし、その枚数×3枚ぶん山札を引く。",
        note:"ポケモンをトラッシュして手札を増やすサポート。"
    },
    {
        name:"ロケット団のファクトリー",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2a/048712_T_ROKETTODANNOFUAKUTORI.jpg",
        effect:"ロケット団のサポートを使っていたプレイヤーは、自分の番に1回、山札を2枚引ける。",
        note:"ロケット団デッキの追加ドローを支えるスタジアム。"
    },
    {
        name:"活力の森",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M1S/047857_T_KATSURIXYOKUNOMORI.jpg",
        effect:"おたがいの草ポケモンは、出したばかりの番でも草ポケモンに進化できる。",
        note:"草ポケモンの進化を早めるスタジアム。"
    },
    {
        name:"夜の鉱山",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2a/048710_T_YORUNOKOUZAN.jpg",
        effect:"おたがいのテラスタルのポケモンは、ワザに必要なエネルギーが1個ぶん多くなる。",
        note:"テラスタルの攻撃を重くするスタジアム。"
    },
    {
        name:"クセロシキのたくらみ",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049421_T_KUSEROSHIKINOTAKURAMI.jpg",
        effect:"相手は手札が3枚になるようにトラッシュする。",
        note:"相手の手札を直接減らす妨害サポート。"
    },
    {
        name:"クラッシュハンマー",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SI/040840_T_KURASSHIXYUHANMA.jpg",
        effect:"コインを1回投げ、オモテなら相手の場のポケモンのエネルギーを1個トラッシュする。",
        note:"運が絡むがエネルギーを削れるグッズ。"
    },
    {
        name:"サーファー",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049424_T_SAFUA.jpg",
        effect:"自分のバトルポケモンをベンチと入れ替え、その後、手札が5枚になるように山札を引く。",
        note:"入れ替えと手札補充を同時にできるサポート。"
    },
    {
        name:"シークレットボックス(ACE SPEC)",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV6/045783_T_SHIKURETTOBOKKUSU.jpg",
        effect:"手札を3枚トラッシュして、グッズ・どうぐ・サポート・スタジアムを1枚ずつ山札から手札に加える。",
        note:"トレーナーズをまとめて探せるACE SPEC。"
    },
    {
        name:"ダークベル",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M5/050289_T_DAKUBERU.jpg",
        effect:"おたがいのバトルポケモンをそれぞれこんらんにする。",
        note:"バトル場のポケモンをこんらんにするグッズ。"
    },
    {
        name:"バトルコロシアム",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M2/048419_T_BATORUKOROSHIAMU.jpg",
        effect:"おたがいのベンチポケモン全員は、相手のワザや特性の効果でダメカンがのらない。",
        note:"ベンチへのダメカンばらまきを防ぐスタジアム。"
    },
    {
        name:"ハンディサーキュレーター",
        kind:"ポケモンのどうぐ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/SV6/045786_T_HANDEISAKIXYURETA.jpg",
        effect:"つけたバトルポケモンがワザのダメージを受けたとき、相手のエネルギーをベンチにつけ替える。",
        note:"相手の攻撃後にエネルギーを動かせるどうぐ。"
    },
    {
        name:"プリズムタワー",
        kind:"スタジアム",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M4/050164_T_PURIZUMUTAWA.jpg",
        effect:"自分の番に1回、手札を2枚トラッシュするなら山札を1枚引ける。",
        note:"手札をトラッシュしながら山札を引けるスタジアム。"
    },
    {
        name:"プレシャスキャリー(ACE SPEC)",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049374_T_PURESHIXYASUKIXYARI.jpg",
        effect:"山札からたねポケモンを好きなだけ選び、ベンチに出す。",
        note:"一気にたねポケモンを展開できるACE SPEC。"
    },
    {
        name:"ポケモン回収サイクロン(ACE SPEC)",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049380_T_POKEMONKAISHIXYUUSAIKURON.jpg",
        effect:"自分の場のポケモン1匹と、ついているすべてのカードを手札にもどす。",
        note:"場のポケモンをまるごと回収できるACE SPEC。"
    },
    {
        name:"メイのはげまし",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/M3/049708_T_MEINOHAGEMASHI.jpg",
        effect:"自分のサイドが相手より多いとき、トラッシュの基本エネルギーを2枚まで2進化ポケモンにつける。",
        note:"劣勢時に2進化ポケモンへエネルギー加速できるサポート。"
    },
    {
        name:"ロケット団のレシーバー",
        kind:"グッズ",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049391_T_ROKETTODANNORESHIBA.jpg",
        effect:"山札から名前にロケット団とつくサポートを1枚選び、手札に加える。",
        note:"ロケット団サポートを探せるグッズ。"
    },
    {
        name:"暗号マニアの解読",
        kind:"サポート",
        imageUrl:"https://www.pokemon-card.com/assets/images/card_images/large/MC/049414_T_ANGOUMANIANOKAIDOKU.jpg",
        effect:"山札から好きなカードを2枚選び、好きな順番で山札の上にもどす。",
        note:"次に引くカードを強く固定できるサポート。"
    }
];

// GameWith「ポケモンチャンピオンズ 使用率ランキング」
// シングル・シーズンM-3（集計日 2026-06-22）の上位100体。
// フォルムで種族値が異なるポケモンはPokeAPIの識別名を使用する。
const championsUsageTop100 = [
    445,1018,778,908,26,398,376,6,823,260,
    450,"basculegion-male",730,279,257,130,"ninetales-alola",861,970,149,
    1000,635,"rotom-wash",983,303,681,911,94,691,655,
    212,637,584,428,658,121,154,937,"samurott-hisui",887,
    197,3,903,448,979,547,9,473,"rotom-heat",700,
    939,"floette-eternal",248,184,530,752,478,36,956,132,
    "zoroark-hisui",748,282,604,227,475,143,254,350,497,
    689,1013,115,900,560,952,545,660,302,460,
    936,727,858,354,80,395,855,"goodra-hisui","slowking-galar",668,
    609,925,652,534,666,"arcanine-hisui",904,733,968,695
];

const championsFormNames = {
    "basculegion-male":"イダイトウ（オス）",
    "ninetales-alola":"アローラキュウコン",
    "rotom-wash":"ウォッシュロトム",
    "samurott-hisui":"ヒスイダイケンキ",
    "rotom-heat":"ヒートロトム",
    "floette-eternal":"フラエッテ（永遠）",
    "zoroark-hisui":"ヒスイゾロアーク",
    "goodra-hisui":"ヒスイヌメルゴン",
    "slowking-galar":"ガラルヤドキング",
    "arcanine-hisui":"ヒスイウインディ"
};

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

function isCardEffectQuiz(){

    return getSelectedQuizMode() === "cardEffect";
}

function updateProfessorAdvice(message){

    const advice =
    document.getElementById("professorAdvice");

    if(advice){
        advice.textContent = message;
    }
}

function getQuizModeAdvice(){

    const mode = getSelectedQuizMode();

    if(mode === "cardEffect"){
        return "カード名を見て、よく使われる効果を思い出してみよう！ まずは何を探すカードか考えるのがコツだよ。";
    }

    if(mode === "evolvesTo"){
        return "進化したあとの姿を思い出してね。分かれ道がある進化は、どの答えでも大丈夫！";
    }

    if(mode === "evolvesFrom"){
        return "進化のつながりを、ひとつ前までゆっくりたどってみよう！";
    }

    if(mode === "baseStat"){
        return "種族値はぴったりでなくても点数がもらえるよ。近い数字を考えてみよう！";
    }

    return "色や形、からだの特徴をよく見ると、名前を思い出せるかもしれないよ！";
}

function concealPokemonNames(text){

    const names = [
        currentPokemon,
        ...currentAcceptedAnswers
    ]
    .filter(Boolean)
    .sort((a,b) => b.length-a.length);

    return names.reduce(
        (result,name) =>
        result.replaceAll(name,"このポケモン"),
        text
    );
}

function createProfessorHint(description){

    if(
        !description ||
        description === "説明文が見つかりませんでした。"
    ){
        return "まだ図鑑メモが見つからないみたい。姿やタイプから考えてみよう！";
    }

    const hiddenDescription =
    concealPokemonNames(description);

    const firstSentence =
    hiddenDescription
    .split(/[。！？]/)[0]
    .slice(0,70);

    return `図鑑メモには「${firstSentence}」とあるよ。ここから想像してみよう！`;
}

function createProfessorCorrectLine(description){

    if(
        !description ||
        description === "説明文が見つかりませんでした。"
    ){
        return "大正解！ またひとつ、ポケモン博士に近づいたね！";
    }

    const lines = [
        `大正解！ 図鑑によると「${description}」なんだって。おもしろいね！`,
        `さすが！ はなのあ博士のメモには「${description}」と書いてあるよ！`,
        `ぴんぽーん！ このポケモンは「${description}」という特徴があるんだよ。`
    ];

    return lines[
        (answeredQuestions+currentPokemonId.toString().length)
        % lines.length
    ];
}

function showProfessorHint(){

    if(!currentQuestionDescription){
        updateProfessorAdvice(
            "クイズをスタートすると、図鑑メモからヒントを出すよ！"
        );
        return;
    }

    updateProfessorAdvice(
        createProfessorHint(currentQuestionDescription)
    );
}

async function createQuestionData(pokemonId){

    if(isCardEffectQuiz()){
        return createCardEffectQuestionData(pokemonId);
    }

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
            description:getJapaneseDescription(species),
            acceptedAnswers:[pokemonName],
            answerPokemonIds:[pokemonId],
            answerDescriptions:[
                getJapaneseDescription(species)
            ]
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
        description:getJapaneseDescription(species),
        acceptedAnswers:
        answerSpecies.map(getJapanesePokemonName),
        answerPokemonIds:answerIds,
        answerDescriptions:
        answerSpecies.map(getJapaneseDescription)
    };
}

function shuffleItems(items){

    return [...items]
    .sort(() => Math.random()-0.5);
}

function getCardMechanic(card){

    if(card.kind !== "ポケモン"){
        return {
            type:"効果",
            name:""
        };
    }

    const abilityMatch =
    card.note.match(/特性「([^」]+)」/);

    if(abilityMatch){
        return {
            type:"特性",
            name:abilityMatch[1]
        };
    }

    const attackMatch =
    card.note.match(/ワザ「([^」]+)」/);

    if(attackMatch){
        return {
            type:"ワザ",
            name:attackMatch[1]
        };
    }

    if(card.effect.includes("ワザ")){
        return {
            type:"ワザ",
            name:""
        };
    }

    if(card.effect.includes("特性")){
        return {
            type:"特性",
            name:""
        };
    }

    return {
        type:"特性",
        name:""
    };
}

function createCardQuestionText(card,mechanic){

    const mechanicName =
    mechanic.name
    ? `「${mechanic.name}」`
    : "";

    if(mechanic.type === "ワザ"){
        if(/^\d+ダメージ/.test(card.effect)){
            return `『${card.name}』のワザ${mechanicName}のダメージと効果は何？`;
        }

        if(card.effect.includes("エネルギー")){
            return `『${card.name}』のワザ${mechanicName}でエネルギーはどうなる？`;
        }

        return `『${card.name}』のワザ${mechanicName}の効果は何？`;
    }

    if(mechanic.type === "特性"){
        return `『${card.name}』の特性${mechanicName}の効果は何？`;
    }

    return `『${card.name}』の効果は何？`;
}

function getCardChoicePool(card,mechanic){

    const sameMechanicChoices =
    cardEffectQuestions.filter(item => {
        if(item.name === card.name){
            return false;
        }

        const itemMechanic =
        getCardMechanic(item);

        return itemMechanic.type === mechanic.type;
    });

    if(sameMechanicChoices.length >= 3){
        return sameMechanicChoices;
    }

    return cardEffectQuestions.filter(
        item => item.name !== card.name
    );
}

function createCardEffectQuestionData(cardIndex){

    const card =
    cardEffectQuestions[cardIndex];

    const mechanic =
    getCardMechanic(card);

    const wrongChoices =
    shuffleItems(
        getCardChoicePool(card,mechanic)
    )
    .slice(0,3)
    .map(item => item.effect);

    const choices =
    shuffleItems([
        card.effect,
        ...wrongChoices
    ]);

    return {
        pokemonId:cardIndex,
        pokemonName:card.name,
        questionText:createCardQuestionText(card,mechanic),
        description:card.note,
        imageUrl:card.imageUrl,
        acceptedAnswers:[card.effect],
        answerPokemonIds:[],
        answerDescriptions:[card.note],
        card,
        mechanic,
        choices,
        correctChoiceIndex:choices.indexOf(card.effect)
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
    ].filter(pokemonId =>
        typeof pokemonId === "string" ||
        (
            pokemonId >= 1 &&
            pokemonId <= 1025
        )
    );
}

function getStatQuizEligibleStats(pokemonId,pokemonData){

    const stats = getPokemonBaseStats(pokemonData);
    const eligibleStats = [];

    if(championsUsageTop100.includes(pokemonId)){
        const offensePeak =
        Math.max(stats.attack,stats["special-attack"]);
        const defenseAverage =
        (stats.hp + stats.defense + stats["special-defense"]) / 3;

        if(offensePeak >= defenseAverage){
            if(stats.attack >= stats["special-attack"]){
                eligibleStats.push("attack");
            }

            if(stats["special-attack"] >= stats.attack){
                eligibleStats.push("special-attack");
            }

            eligibleStats.push("speed");
        }else{
            eligibleStats.push("hp");

            const defenseDifference =
            Math.abs(
                stats.defense-stats["special-defense"]
            );

            if(defenseDifference >= 30){
                eligibleStats.push(
                    stats.defense > stats["special-defense"]
                    ? "defense"
                    : "special-defense"
                );
            }else{
                eligibleStats.push(
                    "defense",
                    "special-defense"
                );
            }

            eligibleStats.push("speed");
        }
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

    const pokemonData =
    await fetchPokemonData(pokemonId);

    const speciesId =
    getPokemonIdFromUrl(pokemonData.species.url);

    const species =
    await fetchPokemonSpecies(speciesId);

    const eligibleStats =
    getStatQuizEligibleStats(pokemonId,pokemonData);

    const statName =
    eligibleStats[
        Math.floor(Math.random()*eligibleStats.length)
    ];

    const stats = getPokemonBaseStats(pokemonData);

    return {
        pokemonId,
        pokemonName:
        championsFormNames[pokemonId] ||
        getJapanesePokemonName(species),
        questionText:
        `このポケモンの「${statLabels[statName]}」の種族値は？`,
        statName,
        statValue:stats[statName],
        description:getJapaneseDescription(species),
        imageUrl:
        pokemonData.sprites.other[
            "official-artwork"
        ].front_default,
        acceptedAnswers:[],
        answerPokemonIds:[pokemonId],
        answerDescriptions:[
            getJapaneseDescription(species)
        ]
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

    if(isCardEffectQuiz()){
        return cardEffectQuestions.map((_,index) => index);
    }

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
    currentCardQuestion = questionData.card
    ? questionData
    : null;
    selectedCardChoiceIndex = null;
    currentQuestionDescription =
    questionData.description || "";
    currentAnswerDescriptions =
    questionData.answerDescriptions || [];

    document.getElementById(
        "questionText"
    ).textContent =
    questionData.questionText;

    document.getElementById(
        "questionPokemonName"
    ).textContent =
    getSelectedQuizMode() === "name" ||
    isCardEffectQuiz()
    ? ""
    : questionData.pokemonName;

    updateProfessorAdvice(
        isCardEffectQuiz()
        ? `出典: アルテマ「ポケカの汎用カード一覧」。${questionData.description}`
        : getSelectedQuizMode() === "baseStat"
        ? `${statLabels[currentStatName]}に注目！ まずは100より高いか低いかを考えてみよう。`
        : getQuizModeAdvice()
    );

    const answerInput =
    document.getElementById("answer");
    const cardChoiceList =
    document.getElementById("cardChoiceList");

    if(isCardEffectQuiz()){
        answerInput.style.display = "none";
        cardChoiceList.style.display = "grid";
        cardChoiceList.innerHTML =
        questionData.choices.map((choice,index) => `
            <button
            type="button"
            class="card-choice-button"
            onclick="selectCardChoice(${index})">
                ${choice}
            </button>
        `).join("");
    }else if(getSelectedQuizMode() === "baseStat"){
        answerInput.style.display = "";
        cardChoiceList.style.display = "none";
        cardChoiceList.innerHTML = "";
        answerInput.placeholder = "種族値を数字で入力";
        answerInput.inputMode = "numeric";
    }else{
        answerInput.style.display = "";
        cardChoiceList.style.display = "none";
        cardChoiceList.innerHTML = "";
        answerInput.placeholder = "ポケモン名を入力";
        answerInput.removeAttribute("inputmode");
    }

    const image =
    questionData.imageUrl ||
    getPokemonImageUrl(questionData.pokemonId);

    const img =
    document.getElementById("pokemonImage");
    const imageFrame =
    document.getElementById("pokemonImageFrame");

    if(isCardEffectQuiz()){
        imageFrame.classList.add("card-art-frame");
        imageFrame.classList.toggle(
            "trainer-art-frame",
            questionData.card.kind !== "ポケモン"
        );
        imageFrame.classList.toggle(
            "pokemon-card-art-frame",
            questionData.card.kind === "ポケモン"
        );
        imageFrame.classList.remove("card-image-missing");
        delete imageFrame.dataset.cardName;
        img.onload = () => {
            imageFrame.classList.remove("card-image-missing");
            delete imageFrame.dataset.cardName;
            img.style.display = "";
        };
        img.onerror = () => {
            img.style.display = "none";
            imageFrame.dataset.cardName =
            questionData.pokemonName;
            imageFrame.classList.add("card-image-missing");
        };
        img.style.display = "";
        img.src = questionData.imageUrl;
        img.alt = questionData.pokemonName;
        img.classList.remove("silhouette");
        img.classList.add("card-quiz-image");
    }else{
        imageFrame.classList.remove("card-art-frame");
        imageFrame.classList.remove(
            "trainer-art-frame",
            "pokemon-card-art-frame"
        );
        imageFrame.classList.remove("card-image-missing");
        delete imageFrame.dataset.cardName;
        img.onload = null;
        img.onerror = null;
        img.style.display = "";
        img.src = image;
        img.alt = questionData.pokemonName;
        img.classList.remove("card-quiz-image");
    }

    if(
      !isCardEffectQuiz() &&
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

    if(quizAction === "result"){
        showQuizResult();
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
    currentCardQuestion = null;
    selectedCardChoiceIndex = null;
    currentQuestionDescription = "";
    currentAnswerDescriptions = [];

    document.getElementById("comboToast").style.display = "none";
    document.getElementById("answer").value = "";
    document.getElementById("answer").style.display = "";
    document.getElementById("cardChoiceList").style.display = "none";
    document.getElementById("cardChoiceList").innerHTML = "";
    document.getElementById("result").textContent = "";
    document.getElementById("timer").textContent = message;
    document.getElementById("pokemonImageFrame").classList.remove("card-art-frame");
    document.getElementById("pokemonImageFrame").classList.remove(
        "trainer-art-frame",
        "pokemon-card-art-frame"
    );
    document.getElementById("pokemonImageFrame").classList.remove("card-image-missing");
    delete document.getElementById("pokemonImageFrame").dataset.cardName;
    document.getElementById("pokemonImage").style.display = "";
    document.getElementById("pokemonImage").onload = null;
    document.getElementById("pokemonImage").onerror = null;
    document.getElementById("pokemonImage").classList.remove("card-quiz-image");
    document.getElementById("pokemonImage").removeAttribute("src");
    document.getElementById("questionText").textContent =
    isCardEffectQuiz()
    ? "カードの効果を選ぼう！"
    : getSelectedQuizMode() === "baseStat"
    ? "ポケモンの種族値を当てよう！"
    : getSelectedQuizMode() === "evolvesTo"
    ? "このポケモンは進化したら何になる？"
    : getSelectedQuizMode() === "evolvesFrom"
        ? "このポケモンの進化元はだれ？"
        : "このポケモンはだれ？";
    document.getElementById("questionPokemonName").textContent = "";
    updateProfessorAdvice(getQuizModeAdvice());
    updateQuizModeUI();

    updateQuestionProgress();
    setQuizActionButton("スタート", "start");
}

function finishQuestion(){

    answeredQuestions++;
    updateQuestionProgress();

    if(answeredQuestions >= getSelectedQuestionTotal()){

        quizFinished = true;

        if(
            getSelectedQuizMode() === "baseStat" ||
            isCardEffectQuiz()
        ){
            setQuizActionButton("結果を表示", "result");
        }else{
            showQuizResult();
        }

        return;
    }

    setQuizActionButton("次の問題へ", "next");
}

function selectCardChoice(choiceIndex){

    if(!isQuestionActive || !currentCardQuestion){
        return;
    }

    selectedCardChoiceIndex = choiceIndex;

    document
    .querySelectorAll(".card-choice-button")
    .forEach((button,index) => {
        button.classList.toggle(
            "selected",
            index === choiceIndex
        );
    });
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
        20-Math.floor(difference/3)
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

    updateProfessorAdvice(
        questionPoints === 20
        ? createProfessorCorrectLine(
            currentQuestionDescription
        )
        : questionPoints >= 15
            ? "かなり近いよ！ 正解の数字も一緒に覚えておこう。"
            : "だいじょうぶ！ 正解を見て、次に少しずつ近づけていこう。"
    );

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

    if(isCardEffectQuiz()){
        checkCardEffectAnswer();
        return;
    }

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

        updateProfessorAdvice(
            createProfessorCorrectLine(
                currentAnswerDescriptions[
                    matchedAnswerIndex
                ] || currentQuestionDescription
            )
        );

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

        updateProfessorAdvice(
            "おしい！ 正解を見て覚えたら、次はきっと答えられるよ。"
        );

        finishQuestion();
    }
}

function checkCardEffectAnswer(){

    if(selectedCardChoiceIndex === null){
        document.getElementById("result").textContent =
        "選択肢を1つ選んでください";
        return;
    }

    clearInterval(timer);
    isQuestionActive = false;

    const buttons =
    document.querySelectorAll(".card-choice-button");

    buttons.forEach((button,index) => {
        button.disabled = true;
        button.classList.toggle(
            "correct",
            index === currentCardQuestion.correctChoiceIndex
        );
        button.classList.toggle(
            "wrong",
            index === selectedCardChoiceIndex &&
            index !== currentCardQuestion.correctChoiceIndex
        );
    });

    if(
        selectedCardChoiceIndex ===
        currentCardQuestion.correctChoiceIndex
    ){
        document.getElementById("result").textContent =
        "⭕ 正解！";

        updateProfessorAdvice(
            `大正解！ ${currentCardQuestion.card.name}の${currentCardQuestion.mechanic.type}は「${currentCardQuestion.card.effect}」だよ。`
        );

        correctAnswers++;
        currentCombo++;
        showComboReward(currentCombo);
    }else{
        currentCombo = 0;

        document.getElementById("result").textContent =
        `❌ 不正解！ 正解は ${currentCardQuestion.card.effect}`;

        updateProfessorAdvice(
            `${currentCardQuestion.card.name}は、${currentCardQuestion.card.note}`
        );
    }

    finishQuestion();
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
            isCardEffectQuiz()
            ? `⏰ 時間切れ！ 正解は ${currentCardQuestion.card.effect}`
            : getSelectedQuizMode() === "baseStat"
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

    const isCardQuiz =
    isCardEffectQuiz();

    document.getElementById(
        "generationFilter"
    ).disabled = isBaseStatQuiz || isCardQuiz;

    document.getElementById(
        "typeFilter"
    ).disabled = isBaseStatQuiz || isCardQuiz;

    const questionCountFilter =
    document.getElementById("questionCountFilter");

    if(isBaseStatQuiz){
        questionCountFilter.value = "10";
    }

    questionCountFilter.disabled = isBaseStatQuiz;

    const silhouetteMode =
    document.getElementById("silhouetteMode");

    silhouetteMode.disabled = isBaseStatQuiz || isCardQuiz;

    if(isBaseStatQuiz || isCardQuiz){
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

    answerInput.style.display =
    isCardQuiz
    ? "none"
    : "";

    document.getElementById("cardChoiceList").style.display =
    isCardQuiz
    ? "grid"
    : "none";

    answerInput.placeholder =
    isCardQuiz
    ? ""
    : isBaseStatQuiz
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
