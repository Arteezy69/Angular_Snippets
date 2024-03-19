using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;
using System.Data.Sql;
using HPDSAP.Core;
using HPDSAP.Core.Interfaces;
using AppUnify.Library.Services.PCF.Returns;
using AppUnify.Library.Models.PCF.Returns;
using AppUnify.Library.Repositories.PCF.Returns;
using System.Data.SqlClient;
using Dapper;
using HPDSAP.Core.Data.DISBURSEMENTS;
using System.IO;
using OfficeOpenXml;
using OfficeOpenXml.Style;

namespace AppUnify.Library.Repositories.PCF.Returns
{
    public class ReturnRepository
    {
        //private ReturnsService repo;
        private IDISBURSEMENTS work;
        private readonly string userCode;

        public ReturnRepository(IDISBURSEMENTS work, string userCode = "")
        {
            this.userCode = userCode;
            this.work = work;
        }


        public IEnumerable<ReturnsModel> GetReturns(DateTime SDate, DateTime Edate, string BrCode,string CashoutId)
        {
            using (IDbConnection cn = new SqlConnection(work.ConnectionString()))
                return cn.Query<ReturnsModel>("sp_returns", new
                {
                    Mode = "load_returns",
                    SDate = SDate,
                    EDate = Edate,
                    BrCode = BrCode,
                    CashoutId = CashoutId
                }, commandType: CommandType.StoredProcedure, commandTimeout: 0);

        }
        public IEnumerable<ReturnsModel> GetReturnsDetails(DateTime SDate, DateTime Edate, string BrCode,int CashoutId)
        {
            using (IDbConnection cn = new SqlConnection(work.ConnectionString()))
                return cn.Query<ReturnsModel>("sp_returns", new
                {
                    Mode = "load_returns_details",
                    SDate = SDate,
                    EDate = Edate,
                    BrCode = BrCode,
                    CashoutId= CashoutId
                }, commandType: CommandType.StoredProcedure, commandTimeout: 0);

        }
        public IEnumerable<ReportsModel> GetReports(DateTime SDate, DateTime Edate, string BrCode)
        {
            using (IDbConnection cn = new SqlConnection(work.ConnectionString()))
                return cn.Query<ReportsModel>("sp_returns", new
                {
                    Mode = "load_reports",
                    SDate = SDate,
                    EDate = Edate,
                    BrCode = BrCode
                }, commandType: CommandType.StoredProcedure, commandTimeout: 0);

        }

        public void InsertReturnAmt(IEnumerable<ReturnsModel> model)
        {
            try
            {
                foreach (var item in model)
                {
                    var record = work.PCFReturns.Find(x => x.DocEntry == item.DocEntry && x.BaseDoc == item.BaseDoc);
                    var cashout = work.PCFCashOuts.Find(x => x.CashOutId == item.CashOutId);

                    record = new PCF_Returns
                    {
                        DocEntry = item.DocEntry,
                        BaseDoc = item.CashOutId,
                        ReturnAmt = item.ReturnAmt,
                        EmpCode = userCode,
                        Active = true,
                        Remarks = item.Remarks,
                        DateCreated = DateTime.Now,
                        CreatedBy = userCode
                    };

                    var returns = work.PCFReturns.Filter(x => x.BaseDoc == record.BaseDoc);
                    var returnAmt = item.ReturnAmt;

                    cashout.ReturnAmt = record.ReturnAmt;
                    cashout.Amt = cashout.GrossAmt - cashout.ReturnAmt;
                    cashout.LastUpdate = DateTime.Now;
                    cashout.UpdateBy = userCode;

                    work.PCFReturns.Add(record);
                    work.Save();
                    
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public void UpdateReturnAmt(ReturnsModel item)
        {
            try
            {
                var record = work.PCFReturns.Find(x => x.DocEntry == item.DocEntry && x.BaseDoc == item.BaseDoc);
                var cashout = work.PCFCashOuts.Find(x => x.CashOutId == item.CashOutId);

                var returns = work.PCFReturns.Filter(x => x.DocEntry == item.DocEntry && x.BaseDoc == record.BaseDoc);
                var cashouts = work.PCFCashOuts.Filter(x => x.CashOutId == item.CashOutId );

                var totalReturnAmt = returns.Where(x => x.Active).Sum(x => x.ReturnAmt);
                var totalCashAmt= cashouts.Sum(x => x.ReturnAmt);

                record = new PCF_Returns
                {
                    DocEntry = item.DocEntry,
                    BaseDoc = item.CashOutId,
                    ReturnAmt = item.ReturnAmt - totalReturnAmt,
                    EmpCode = userCode,
                    Active = true,
                    Remarks = item.Remarks,
                    DateCreated = DateTime.Now,
                    CreatedBy = userCode
                };

                var DiffReturnAmt = item.ReturnAmt - totalReturnAmt;
                cashout.ReturnAmt = totalCashAmt + DiffReturnAmt;
                cashout.Amt = cashout.GrossAmt- (totalCashAmt+ DiffReturnAmt);
                cashout.LastUpdate = DateTime.Now;
                cashout.UpdateBy = userCode;

                work.PCFReturns.Add(record);
                work.Save();

            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        public string Export(IEnumerable<ReturnsModel> model)
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
                        xlWS.Cells[row, col++].Value = "CashoutId";
                        xlWS.Cells[row, col++].Value = "Gross Amount";
                        xlWS.Cells[row, col++].Value = "Amount";
                        xlWS.Cells[row, col++].Value = "Return Amount";
                        xlWS.Cells[row, col++].Value = "Created By";
                        xlWS.Cells[row, col++].Value = "Date Created"; 
                        xlWS.Cells[row, col++].Value = "Last Update";
                        xlWS.Cells[row, col++].Value = "Update By";



                        xlWS.Cells[row, 1, row, col].Style.Font.Bold = true;

                        row++;

                        // DETAILS
                        startRow = row;
                        foreach (var item in model)
                        {
                            col = 1;
                            xlWS.Cells[row, col++].Value = item.CashOutId;
                            xlWS.Cells[row, col].Value = item.GrossAmt;
                            xlWS.Cells[row, col++].Style.Numberformat.Format = "0.00";

                            xlWS.Cells[row, col].Value = item.Amt;
                            xlWS.Cells[row, col++].Style.Numberformat.Format = "0.00";

                            xlWS.Cells[row, col].Value = item.ReturnAmt;
                            xlWS.Cells[row, col++].Style.Numberformat.Format = "0.00"; 

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

        public string ExportReports(IEnumerable<ReturnsModel> model)
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
                        xlWS.Cells[row, col++].Value = "DocEntry";
                        xlWS.Cells[row, col++].Value = "Return Amount";
                        xlWS.Cells[row, col++].Value = "Remarks";
                        xlWS.Cells[row, col++].Value = "Created By";
                        xlWS.Cells[row, col++].Value = "Date Created";
                        xlWS.Cells[row, col++].Value = "Last Update";
                        xlWS.Cells[row, col++].Value = "Update By";



                        xlWS.Cells[row, 1, row, col].Style.Font.Bold = true;

                        row++;

                        // DETAILS
                        startRow = row;
                        foreach (var item in model)
                        {
                            col = 1;
                            xlWS.Cells[row, col++].Value = item.DocEntry;

                            xlWS.Cells[row, col].Value = item.ReturnAmt;
                            xlWS.Cells[row, col++].Style.Numberformat.Format = "0.00";

                            xlWS.Cells[row, col++].Value = item.Remarks;
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

    }
}
