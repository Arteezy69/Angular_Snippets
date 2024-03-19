//Controller


 
 //Repo
 public void DuplicateGlAccs(IEnumerable<GlAccsDuplicateModel> model)
        {
            repo.DuplicateGlAccs(model);
        } 
 
 
 //Service
 public void DuplicateGlAccs(IEnumerable<GlAccsDuplicateModel> model)
        {

            try
            {
                work_disb.BeginTran();

                foreach (var item in model)
                {
                    var records = work_disb.PCFAcctBranches.Filter(x => x.BrCode == item.BrCode && x.Active == true);
                    foreach (var record in records)
                    {
                        record.LastUpdate = DateTime.Now;
                        record.UpdateBy = userCode;
                        record.Active = false;
                    }

                    int lineId = 0;
                    var latestId = work_disb.PCFAcctBranches.MaxInt(x => x.Id) + 1;
                    foreach (var selectedRow in item.SelectedRows)
                    {
                        if (records.Count()  > 0)
                        { 

                            var newRecord = new HPDSAP.Core.Data.DISBURSEMENTS.PCF_AcctBranches
                            {
                                LineId = ++lineId,
                                Id = latestId,
                                BrCode = item.BrCode,
                                Active = true,
                                DateCreated = DateTime.Now,
                                CreatedBy = userCode,
                            };

                            work_disb.PCFAcctBranches.Add(newRecord);
                        }
                    }
                }
                work_disb.Save();
                work_disb.Commit();
            }
            catch (Exception ex)
            {
                work_disb.Rollback();
                throw ex;
            }

        }