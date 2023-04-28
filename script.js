// Load the JSON file

fetch('ledscreens.json')
	.then(response => response.json())
	.then(data => {
		const select = document.getElementById('device-select');
		//const screenPieces = document.getElementById('screen-pieces');

        // Sort the devices by name alphabetically
        data.sort((a, b) => a.Name.localeCompare(b.Name));

		// Populate the dropdown menu
		data.forEach(device => {
			const option = document.createElement('option');
			option.text = device.Name;
			select.add(option);
		});

		// Update the device information when the dropdown selection changes or the number of screen pieces changes
		function updateDeviceInfo() {
			const deviceName = select.value;
			const device = data.find(device => device.Name === deviceName);
			const deviceInfoDiv = document.querySelector('.device-info');

			// Clear any existing device information
			deviceInfoDiv.innerHTML = '';

			// Create a new div for the device information
			const deviceDiv = document.createElement('div');
			deviceDiv.classList.add('device-info');

			// Calculate total pixels and total power based on the number of screen pieces
			let numCols = document.getElementById('screen-cols').value;
			let numRows = document.getElementById('screen-rows').value;
            if(numCols==0){
                numCols=1;
            }
            if(numRows==0){
                numRows=1;
            }
			drawGrid(numRows, numCols, device);
			const totalPixels = device.PixelWidth * device.PixelHeight;
			const totalPower = device.PowerDraw * (numCols * numRows);

			// Add each piece of device information as a new paragraph
			Object.keys(device).forEach(key => {
				if (key !== 'Name') {
					const p = document.createElement('p');
					if (key === 'TotalPixels') {
						p.textContent = `${key}: ${totalPixels}`;
					//} else if (key === 'PowerDraw') {
					//	p.textContent = `${key}: ${totalPower} W`;
					} else {
						p.textContent = `${key}: ${device[key]}`;
					}
					deviceDiv.appendChild(p);
				}
			});

			// Append the device information div to the main device information div
			deviceInfoDiv.appendChild(deviceDiv);
		}

		function drawGrid(numRows, numCols, device) {
			const gridContainer = document.querySelector(".grid-container");
		  
			// clear existing grid
			gridContainer.innerHTML = "";
		  
			// create rows and columns
			for (let i = 0; i < numRows; i++) {
			  const row = document.createElement("div");
			  row.classList.add("grid-row");
			  for (let j = 0; j < numCols; j++) {
				const column = document.createElement("div");
				column.classList.add("grid-column");
				row.appendChild(column);
				if ((i + j) % 2 == 0) {
				  column.style.backgroundColor = "green";
				} else {
				  column.style.backgroundColor = "red";
				}
			  }
			  gridContainer.appendChild(row);
			}

		  
			// show grid dimensions
			const dimensions = document.querySelector(".grid-info");
			
			const totalPower = device.PowerDraw * (numCols * numRows);
			const AmountOfPhases = totalPower / 3000;
			var AmountOfPhasesF = AmountOfPhases.toFixed(1);

			// write grid dimension to the innerHTML
			const VerticalPixels  = device.PixelHeight * numRows; //y pixel - pysty
			const HorizontalPixels = device.PixelWidth * numCols; //x pixel - vaaka
			const totalAmount = numRows * numCols;
			
			const TotalPixels = VerticalPixels * HorizontalPixels;
			const totalWidth = device.PhysicalWidth * numCols;
			const totalHeight = device.PhysicalHeight * numRows;
			const totalWeight = device.Weight * totalAmount;
			//const totalPower = device.PowerDraw * (numCols * numRows);

			var totalWeghtF = totalWeight.toFixed(2);
			var totalHeightF = totalHeight.toFixed(2);
			var totalWidthF = totalWidth.toFixed(2);
			

			dimensions.innerHTML = '';
			dimensions.innerHTML = "Total amount: " + totalAmount; 
			dimensions.innerHTML += "<br>Resolution: " + HorizontalPixels + "px * " + VerticalPixels + "px";
			dimensions.innerHTML += "<br>Total Pixels: " + TotalPixels + "px";
			dimensions.innerHTML += "<br>Physical dimensions: " + totalWidthF + "mm * " + totalHeightF + "mm";
			dimensions.innerHTML += "<br>Total powerdraw: " + totalPower + "w";
			dimensions.innerHTML += "<br>Number of phases (3000W): " + AmountOfPhasesF;
			dimensions.innerHTML += "<br>Total weight: " + totalWeghtF + "kg";
			dimensions.innerHTML += "<br><br>";
		}
		  




		// Update the device information when the dropdown selection changes or the number of screen pieces changes
		select.addEventListener('change', updateDeviceInfo);
		//screenPieces.addEventListener('input', updateDeviceInfo);
		document.getElementById('screen-cols').addEventListener('input', updateDeviceInfo);
		document.getElementById('screen-rows').addEventListener('input', updateDeviceInfo);

		// Initialize the device information with the first device in the JSON file
		updateDeviceInfo();
	});
