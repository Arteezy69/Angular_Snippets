using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HPDSAP.Core;
using HPDSAP.Core.Interfaces;
using AppUnify.Library.Services.PCF.Returns;
using AppUnify.Library.Models.PCF.Returns;
using AppUnify.Library.Repositories.PCF.Returns;
using AppUnify.Library.Repositories.PCF;
using HPDSAP.Core.Data.DISBURSEMENTS;
using AppUnify.Library.Models.PCF;


namespace AppUnify.Library.Services.PCF.Returns
{
    public class ReturnsService
    {
        private ReturnRepository repo;
        private readonly DISBURSEMENTS work;
        private readonly string userCode;

        //added
        private readonly RegularRepository updateRepo;

        private readonly ReturnRepository update;
        private readonly ReturnRepository insertRepo;

        public ReturnsService(string userCode = "")
        {
          
            work = new DISBURSEMENTS();
            repo = new ReturnRepository(this.work, userCode);
            //added
            updateRepo = new RegularRepository(this.work, userCode);
            insertRepo = new ReturnRepository(this.work, userCode);

        }


        public IEnumerable<ReturnsModel> GetReturns(DateTime SDate, DateTime EDate, string BrCode, string CashoutId)
        {
            if (string.IsNullOrEmpty(BrCode)) throw new ApplicationException("You are not connected to any branch.");

            return repo.GetReturns(SDate, EDate, BrCode,CashoutId);
        }
        public IEnumerable<ReturnsModel> GetReturnsDetails(DateTime SDate, DateTime EDate, string BrCode, int CashoutId)
        {
            return repo.GetReturnsDetails(SDate, EDate, BrCode, CashoutId);
        }

        public IEnumerable<ReportsModel> GetReports(DateTime SDate, DateTime EDate, string BrCode)
        {
            return repo.GetReports(SDate, EDate, BrCode);
        }

        public void ReturnAmt(IEnumerable<ReturnsModel> model)
        {
            try
            {
                work.BeginTran();

                foreach (var item in model)
                {
                    var records = work.PCFTransactions.Find(x => x.DocEntry == item.DocEntry && x.CashOutId==item.CashOutId);
                    var regularModel = new PCFRegularModel
                    {
                        DocEntry=item.DocEntry,
                        GrossAmt = item.GrossAmt,
                        ReturnAmt = item.ReturnAmt,
                        Amt=item.GrossAmt-item.ReturnAmt,
                        ReturnRemarks=item.ReturnRemarks,
                        LastUpdate = DateTime.Now,
                        UpdateBy = userCode,
                        AcctCode=item.AcctCode,
                        Active = true,
                        Descrip=item.Descrip,
                        DeptCode = item.DeptCode,
                        EmpCode = item.EmpCode,
                        SecCode = item.SecCode,
                    };
                    //Transactions
                    updateRepo.Update(regularModel);

                    var record = work.PCFReturns.Find(x => x.DocEntry == item.DocEntry && x.BaseDoc == item.BaseDoc);
                    if (record == null)
                    {
                        insertRepo.InsertReturnAmt(model);
                    }
                    else
                    {
                        insertRepo.UpdateReturnAmt(item);
                    } 

                    work.Commit();
                }

            }
            catch (Exception ex)
            {
                work.Rollback();
                throw ex;
            }
        }

        public string Export(IEnumerable<ReturnsModel> model)
        {
            return repo.Export(model);
        }
        public string ExportReports(IEnumerable<ReturnsModel> model)
        {
            return repo.ExportReports(model);
        }
    }
}
