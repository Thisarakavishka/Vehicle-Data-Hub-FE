"use client";

import { Button } from "@nextui-org/button";
import UploadIcon from "@/components/icons/UploadIcon";
import SearchIcon from "@/components/icons/SearchIcon";
import ExportIcon from "@/components/icons/ExportIcon";
import { Input } from "@nextui-org/input";
import axios from "axios";
import { useState } from "react";
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from "@nextui-org/react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) {
      console.log("No file selected");
      return;
    }

    setFile(selectedFile);
    console.log("Selected file:", selectedFile.name);

    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: `
          mutation uploadFile($file: Upload!) { 
            uploadFile(file: $file) 
          }
        `,
        variables: { file: null },
      })
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", selectedFile);

    try {
      const response = await axios.post("http://localhost:3002/graphql", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data?.data?.uploadFile) {
        console.log("File uploaded successfully:", response.data);
        fetchDataWithRetry();
      } else {
        console.log("File upload failed or response malformed:", response.data);
      }
    } catch (error) {
      console.error("File upload failed:", error);
    }
  };

  const fetchDataWithRetry = async (retries = 5, delay = 2000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      if (dataFetched) break;
      try {
        const response = await axios.post("http://localhost:3001/graphql", {
          query: `
            query {
              initialFetch {
                vehicles {
                  firstName
                  lastName
                  email
                  carMake
                  carModel
                  vin
                  manufacturedDate
                  ageOfVehicle
                }
                pageCount
              }
            }
          `,
        });

        const { vehicles, pageCount } = response.data.data.initialFetch;
        if (vehicles.length > 0) {
          setData(vehicles);
          setDataFetched(true);
          console.log("Fetched vehicles:", vehicles);
          break;
        } else {
          console.log("No data available yet, retrying...");
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  };

  const handleEdit = (row: any) => {
    // Add your edit logic here
    console.log("Edit row:", row);
  };

  const handleDelete = (row: any) => {
    // Add your delete logic here
    console.log("Delete row:", row);
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100">
      <div className="flex items-center space-x-4 pt-5">
        <Button
          size="md"
          variant="ghost"
          startContent={<UploadIcon />}
          onClick={() => document.getElementById("fileInput")?.click()}
        >
          Upload
        </Button>
        <Button size="md" variant="ghost" startContent={<ExportIcon />}>
          Export
        </Button>
        <Input
          size="md"
          type="search"
          variant="bordered"
          startContent={<SearchIcon />}
          placeholder="Search"
          className="w-96"
        />
        <Button size="md" variant="ghost">
          + add new
        </Button>
      </div>

      <input
        type="file"
        id="fileInput"
        style={{ display: "none" }}
        accept=".csv, .xlsx"
        onChange={handleFileSelection}
      />

      <div className="flex justify-center w-full p-8 bg-gray-100 min-h-screen">
        <div className="w-full max-w-screen-xl bg-white shadow-lg rounded-lg overflow-x-auto">
          <Table aria-label="Car data table" className="min-w-full">
            <TableHeader>
              <TableColumn>First Name</TableColumn>
              <TableColumn>Last Name</TableColumn>
              <TableColumn>Email</TableColumn>
              <TableColumn>Car Make</TableColumn>
              <TableColumn>Car Model</TableColumn>
              <TableColumn>VIN</TableColumn>
              <TableColumn>Manufactured Date</TableColumn>
              <TableColumn>Age of Vehicle</TableColumn>
              <TableColumn>Action</TableColumn>
            </TableHeader>

            <TableBody>
              {data.map((row, index) => (
                <TableRow key={index} className="border-b hover:bg-gray-50 transition-colors duration-200">
                  <TableCell>{row.firstName}</TableCell>
                  <TableCell>{row.lastName}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>{row.carMake}</TableCell>
                  <TableCell>{row.carModel}</TableCell>
                  <TableCell>{row.vin}</TableCell>
                  <TableCell>{new Date(row.manufacturedDate).toLocaleDateString()}</TableCell>
                  <TableCell>{row.ageOfVehicle}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button size="sm" variant="flat" color="primary" onClick={() => handleEdit(row)}>Edit</Button>
                    <Button size="sm" variant="flat" color="danger" onClick={() => handleDelete(row)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
