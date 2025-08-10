

try {
     //alert(mensajeInicial); /* otro error */

//Elementos del DOM y links
  const apiURL = "https://mindicador.cl/api" //url API
  const inputCLP = document.getElementById("input-clp"); // Input (para ingresar valor e CLP)
  const currencySelector = document.getElementById("curr-sel"); // Selector de indicadores y divisas
  const btnCalcular = document.getElementById("btn-calcular"); // Botón "BUSCAR"
  const resultDiv = document.getElementById("result"); // Div de resultado bajo el botón 
  const chartTitle = document.getElementById("graphic-title"); // Título extra del gráfico


  function intro(){
      let mensajeInicial = `Esto es un conversor de moendas, se conecta con la API ${apiURL}.
   
Para utilizarla solo debes ingresar una cantidad (en pesos chilenos) en el recuadro indicado, elegir el indicador al cual desease convertir la cantidad y luego apretar el botón, "${btnCalcular.innerText}". Adicionalmente podrás visualizar una gráfica con el flujo de valores de los últimos 10 dias.`
alert(mensajeInicial)
  };

  //FETCH
  //fetch data (todo tipo de indicadores)
  const getCurrencyData = async () => {
    const res = await fetch(apiURL);
    const data = await res.json();

    //No conseguí encontrar un nombre para invocar al objeto por lo que utilicé estos metodos para filtrar sus llaves y valores (para así acceder a los objetos dentro del objeto e igualemnte a los valores de este (codigo, valor))
    const labels = Object.keys(data).filter((_, index) => index > 3);
    const valores = Object.values(data).filter((_, index) => index > 3);

    return { data, labels, valores };
  };
  //fetch data (indicador específico)
  //Soy consciente de que podría intenar colocar todo en un solo fetch delimiatado por condiciones, pero por las dificultades que tuve para manipular los valores de la API, preferí mantenerlos separados.

  const getCurrencySpecificData = async (indicador) => {
    const res = await fetch(`${apiURL}/${indicador}`);
    const data = await res.json();
    const series = data.serie;

    return { data, series };
  };
  








  //renderizar select options argument: labels
  const renderSelector = async (labels) => {
    let template = "";
     template += `<option disabled selected class="dummy" value="">--Elige un indicador--</option>`
    labels.forEach((item) => {
      template += `<option value="${item}">${item.replaceAll("_", " ")}</option>`;
    });
    currencySelector.innerHTML = template;
  };

  // argument: valores
  const calculateExchange = async () => {
    const {valores} = await getCurrencyData(); //se trabajará en init
     resultDiv.innerHTML = `CLP   <i class="fa-solid fa-arrow-right"></i>    indicador`

    // cosas que pasan al cargar el botón (fetch, calculo y render)
    btnCalcular.addEventListener("click", async () => {
      //Si el usuario hace click en el botón --eligue un indicador--, se avisa del error y se devuelve el mismo valor (vacío)
      if(!currencySelector.value){
        alert('Selecciona un indicador porfavor');
        return currencySelector.value = '';
      }

      //Si el valor no es el default se invoca el renderizador de gráfico, que a su vez llama al preload (prapareCahrt) y al fetch especifico
      await renderChart(currencySelector.value);
      const index = valores.findIndex(
        (el) => el.codigo === currencySelector.value
      );
      const selectedValue = Number(valores[index].valor);
      const clpCurrency = Number(inputCLP.value);
      const standardmsg = `1  ${currencySelector.value
        .toUpperCase()
        .replace("_", " ")}  equivale a ~ ${1 * selectedValue} CLP  `;

      if (isNaN(clpCurrency) || clpCurrency === 0) {
        alert("Por favor ingrea un monto válido");
        resultDiv.innerText = standardmsg;
        inputCLP.value = "";
        return;
      }

      const calculo = clpCurrency / selectedValue;

      resultDiv.innerText = `${clpCurrency} CLP equivale a ~ ${calculo.toFixed(
        5
      )}  ${currencySelector.value.toUpperCase().replaceAll("_", " ")} `;
      inputCLP.value = "";

      /*Se intenta direccionar al usuario a un uso correcto con alerts y condiciones*/
    });
  };







  //PREPARAR GRÁFICOS

  const prepareChart = async (curr) => {
    const {series} = await getCurrencySpecificData(curr);

    const labels = series.map((item) => item.fecha.split("T")[0]).filter((_, index) =>  index <= 10).reverse();
    const data = series.map((item) => item.valor);
  
    //Chart Title
    chartTitle.innerHTML = `Indicador : ${(currencySelector.value.slice(0, 1).toUpperCase()).concat(currencySelector.value.slice(1, currencySelector.value.length ).replace("_", " "))}`;

    // elementos del chart (etiquetas, color de linea y datos
    const datasets = [
      {
        label: "Valor - Indicador",
        borderColor: "rgb(0, 0, 0)",
        data,
      },
    ];

    return { labels, datasets };
  };

//Por lo que estuve probando esta varaible almacena isntancia de gráficos para evitar sobreescritura.
  let chartInstance = null;

  //Decidí renderizar el gráfico en la medida que se elija un indicador aunque no haya un input en CLP para mostrar el valor en pesos de una unidad del indicador, creo que hace la aplicación menos hostil. 
  const renderChart = async (curr) => {
    const data = await prepareChart(curr);
    const config = {
      type: "line",
      data,
    };


    //En el canvas del HTML, si no hay ya un gráfico, se crea uno, que se almacena en chartIsntance.
    //En caso de que ya haya un gráfico almacenado, la gráfica se desrtuyre -chartInstance.destroy()-
    const myChart = document.getElementById("my-chart");
    myChart.style.backgroundColor = "white";
    if(chartInstance) chartInstance.destroy();
    chartInstance = new Chart(myChart, config);
  };




  //Una función para inicailizar todo:
  const initialize = async () => {
    const { labels } = await getCurrencyData();
    renderSelector(labels);
    calculateExchange();
  };
  initialize();
  

  // Error Test: Activar la función de abajo.
 //thisIsNotAFunctions();  /* <- Esta*/


  // Se renderiza un alert un mensaje simple para advertir al usuario.
} catch (error) {
  const container = document.querySelector('.main-container')
  alert("There is something wrong");
  console.log(error);

  container.innerHTML = `
    <div class="warning">
    <h1>Está página no está disponible en este momento :(</h1>
    <p>Estamos trabajando para solucionarlo</p>
    <i class="fa-solid fa-screwdriver-wrench"></i>
    </div>
  `
  
}
