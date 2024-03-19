//Create Controller

//Create Repo
public string ExportGlSetup(IEnumerable<GlSetupModel> model)
{
    return repo.ExportGlSetup(model);
}



//Create Service
  public string ExportGlSetup(IEnumerable<GlSetupModel> model)
        {
            try
            {
                using (MemoryStream ms = new MemoryStream())
                {
                    using (ExcelPackage pck = new ExcelPackage())
                    {
                        ExcelWorksheet xlWS = null;
                        int row = 1;
                        int col = 1;
                        int startRow = 1;

                        xlWS = pck.Workbook.Worksheets.Add("Sheet1");

                        // HEADER
                        xlWS.Cells[row, col++].Value = "AcctCode";
                        xlWS.Cells[row, col++].Value = "AcctName"; // Add AcctName header
                        xlWS.Cells[row, col++].Value = "Description";
                        xlWS.Cells[row, col++].Value = "Status";
                        xlWS.Cells[row, col++].Value = "Created By";
                        xlWS.Cells[row, col++].Value = "Date Created"; // Add Date Created header
                        xlWS.Cells[row, col++].Value = "Last Update";
                        xlWS.Cells[row, col++].Value = "Update By";
                       
                        

                        xlWS.Cells[row, 1, row, col].Style.Font.Bold = true;

                        row++;

                        // DETAILS
                        startRow = row;
                        foreach (var item in model)
                        {
                            col = 1;
                            xlWS.Cells[row, col++].Value = item.AcctCode;
                            xlWS.Cells[row, col++].Value = item.AcctName; 
                            xlWS.Cells[row, col++].Value = item.Descrip;
                            xlWS.Cells[row, col++].Value = item.Active ? "Active" : "Inactive";
                            xlWS.Cells[row, col++].Value = item.CreatedBy;
                            xlWS.Cells[row, col++].Value = item.DateCreated.ToString("yyyy-MM-dd"); 
                            xlWS.Cells[row, col++].Value = item.LastUpdate == DateTime.Parse("1900-01-01") ? "" : item.LastUpdate.ToString("yyyy-MM-dd");
                            xlWS.Cells[row, col++].Value = item.UpdateBy;
                            
                           
                            row++;
                        }
                        xlWS.Cells.AutoFitColumns();

                        pck.SaveAs(ms);
                        return Convert.ToBase64String(ms.ToArray());
                    }
                }
            }
            catch (Exception ex)
            {
                throw new ApplicationException("An error occurred while exporting data to Excel.", ex);
            }
        }