try {

  /* Error Test */


  const apiURL = "https://mindicador.cl/api" 
  const inputCLP = document.getElementById("input-clp");
  const currencySelector = document.getElementById("curr-sel");
  const btnCalcular = document.getElementById("btn-calcular");
  const resultDiv = document.getElementById("result");
  const chartTitle = document.getElementById("graphic-title");


  //FETCH
  //fetch data (todo tipo de indicadores)
  const getCurrencyData = async () => {
    const res = await fetch(apiURL);
    const data = await res.json();

    const labels = Object.keys(data).filter((_, index) => index > 3);
    const valores = Object.values(data).filter((_, index) => index > 3);

    return { data, labels, valores };
  };
  //fetch data (indicador específico)
  const getCurrencySpecificData = async (indicador) => {
    const res = await fetch(`${apiURL}/${indicador}`);
    const data = await res.json();
    const series = data.serie;

    return { data, series };
  };
  
//////////////////////


  //renderizar select options argument: labels
  const renderSelector = async (labels) => {
    let template = "";
     template += `<option disabled selected class="dummy" value="ivp">--Elige un indicador--</option>`
    labels.forEach((item) => {
      template += `<option value="${item}">${item.replace("_", " ")}</option>`;
    });
    currencySelector.innerHTML = template;
  };

  // argument: valores
  const calculateExchange = async () => {
    const {valores} = await getCurrencyData(); //se trabajará en init

    // cosas que pasan al cargar el botón (fetch, calculo y render)
    btnCalcular.addEventListener("click", async () => {
      await renderChart(currencySelector.value);
      const index = valores.findIndex(
        (el) => el.codigo === currencySelector.value
      );
      const selectedValue = Number(valores[index].valor);
      const clpCurrency = Number(inputCLP.value);
      const standardmsg = `1 ${currencySelector.value
        .toUpperCase()
        .replace("_", " ")} equivale a ${1 * selectedValue}
     CLP ~ `;

      if (isNaN(clpCurrency) || clpCurrency === 0) {
        alert("Por favor ingrea un monto válido");
        resultDiv.innerText = standardmsg;
        inputCLP.value = "";
        return;
      }

      const calculo = clpCurrency / selectedValue;

      resultDiv.innerText = `${clpCurrency} (CLP) equivale a ${calculo.toFixed(
        5
      )} ~ (${currencySelector.value.toUpperCase().replace("_", " ")}) `;
      inputCLP.value = "";
    });
  };


  const prepareChart = async (curr) => {
    const {series} = await getCurrencySpecificData(curr);
    
    const labels = series.map((item) => item.fecha.split("T")[0]);
    const data = series.map((item) => item.valor);
  
    //Chart Title
    chartTitle.innerHTML = `Indicador - ${(currencySelector.value.slice(0, 1).toUpperCase()).concat(currencySelector.value.slice(1, currencySelector.value.length ).replace("_", " "))}`;

    const datasets = [
      {
        label: "Valor - Indicador",
        borderColor: "rgb(255, 255, 255)",
        data,
      },
    ];

    return { labels, datasets };
  };


    let chartInstance = null;
  const renderChart = async (curr) => {
    const data = await prepareChart(curr);

    const config = {
      type: "line",
      data,
    };

    console.log(config);


    const myChart = document.getElementById("my-chart");
    myChart.style.backgroundColor = "#333";
    if(chartInstance) chartInstance.destroy();
    chartInstance = new Chart(myChart, config);
  };

  const start = async () => {
    const { labels } = await getCurrencyData();
    renderSelector(labels);
    calculateExchange();
   
  };
  start();

    
    /* Error Test:
    Desactivar la función de abajo.
    */

   //thisIsNotAFunctions();



} catch (error) {
  const container = document.querySelector('.main-container')
  alert("There is something wrong");
  console.log(error);

  container.innerHTML = `
    <div class="warning">
    <h1>Algo muy malo pasó :(</h1>
    <img src='https://random.dog/3b5eae93-b3bd-4012-b789-64eb6cdaac65.png' alt="imagen de contención">
    </div>
  `
  
}
